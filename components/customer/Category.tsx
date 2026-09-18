import Link from "next/link";
import { CatalogueTreeCategory, CategoryGroup } from "@/lib/types";

import { IconWrench, IconScissors, IconTruck, IconGrid, IconChevronRight } from "@/components/ui/icons";

// Add descriptions and custom link text/hrefs to GROUP_META
const GROUP_META: Record<
    CategoryGroup,
    {
        label: string;
        description: string;
        icon: React.ComponentType<{ size?: number; className?: string }>;
        exploreText: string;
        exploreHref: string;
    }
> = {
    HOME_REPAIR: {
        label: "Home & Repair",
        description: "Essential household repairs, piping, woodwork, and refrigeration.",
        icon: IconWrench,
        exploreText: "Explore all home repair services",
        exploreHref: "/discover/home-repair",
    },
    PERSONAL: {
        label: "Personal & Beauty",
        description: "At-home grooming, celebration styling, traditional Gele, and bespoke tailoring.",
        icon: IconScissors,
        exploreText: "Explore all personal care services",
        exploreHref: "/discover/personal",
    },
    MOBILITY: {
        label: "Moving & Delivery",
        description: "Reliable logistics, house moving, and package delivery.",
        icon: IconTruck,
        exploreText: "Explore all moving & delivery services",
        exploreHref: "/discover/mobility",
    },
    GENERAL: {
        label: "More Services",
        description: "Discover additional specialized local services.",
        icon: IconGrid,
        exploreText: "Explore all other services",
        exploreHref: "/discover/general",
    },
};

export function CategoryGroups({ tree, locationName = "Lekki" }: { tree: CatalogueTreeCategory[] | null; locationName?: string }) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {(Object.keys(GROUP_META) as CategoryGroup[]).map((group) => {
                const cats = (tree ?? []).filter((c) => c.group_key === group);
                if (cats.length === 0) return null;

                const Meta = GROUP_META[group];

                // Calculate total active services across all categories in this group
                const totalActive = cats.reduce((acc, cat) => acc + (cat.services?.length ?? 0), 0);

                return (
                    <div
                        key={group}
                        className="flex flex-col justify-between rounded-3xl  bg-white p-6 "
                    >
                        <div>
                            {/* Top Bar: Icon + Active Badge */}
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <Meta.icon size={22} className="text-blue-600" />
                                </div>
                                <span className="rounded-full bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-600">
                                    {totalActive} active in {locationName}
                                </span>
                            </div>

                            {/* Title & Description */}
                            <div className="mt-4">
                                <h3 className="text-xl font-bold text-slate-900">{Meta.label}</h3>
                                <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                                    {Meta.description}
                                </p>
                            </div>

                            {/* Sub-categories Grid */}
                            <div className="mt-6 grid grid-cols-2 gap-2.5">
                                {cats.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/discover/${cat.slug}`}
                                        className="flex items-center justify-between rounded-xl bg-blue-50 px-3.5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 hover:text-blue-600"
                                    >
                                        <span className="truncate">{cat.name}</span>
                                        <IconChevronRight size={16} className="shrink-0 text-slate-400" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Bottom Footer Link */}
                        <div className="mt-8 pt-2">
                            <Link
                                href={Meta.exploreHref}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                {Meta.exploreText.replace("{count}", cats.length.toString())}
                                <IconChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}