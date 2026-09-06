# Deevi — Google Stitch design brief

How to use this in Stitch: paste **Section 1 (App + Theme)** first as the overall context /
first prompt so Stitch locks the visual system. Then generate each screen by pasting its block
from **Section 3**. Every screen prompt already assumes the theme in Section 1, but you can
re-paste the "Theme" paragraph at the top of any single screen prompt if Stitch drifts.

Deevi is mobile-first — always ask Stitch for the **mobile** layout first, then "desktop
version of this screen".

---

## 1. App + Theme (paste this first)

**App:** Deevi is a two-sided local-services marketplace for Nigeria. Customers post a job in
their own words (e.g. "fix my leaking kitchen pipe", "makeup for my wedding", "move my flat to
Yaba"), and relevant, **verified** artisans nearby apply with a price and timeline. The
customer compares applicants, chats with them, selects one, the work gets done, and the
customer leaves a review. There are three roles: **Customer**, **Artisan**, and **Admin**
(an internal operations console). Deevi does **not** handle payments — customers and artisans
settle directly, so there are no checkout, wallet, or card screens.

**Feeling:** professional, calm, trustworthy, modern, human, and distinctly Nigerian. Think of
the clarity of Stripe, the marketplace structure of Upwork, the human warmth of Airbnb, and the
clean product polish of Linear — but original, not a copy. Trust is the core value: verified
badges, real ratings, clear job status. No manipulative urgency, no fake stats, no clutter.

**Theme / design system:**
- **Primary (Deevi Blue):** `#1b47d6`. Hover/darker `#1738ac`. Tints: `#eef4ff` (subtle
  background), `#dbe6ff`, `#90b2ff`. Blue is for primary buttons, links, active states, and
  trust elements.
- **Ink (near-black):** `#0b1220` for headings and strong text; `#354152` for body text.
- **Surfaces:** cards and sheets are pure white `#ffffff`; the app background is a soft off-white
  `#f6f7f9`.
- **Gray:** borders/dividers `#e6e9ef`; muted/secondary text `#6b7688`.
- **Orange (accent, used very sparingly):** `#f5820b` — ONLY for urgency/warnings (e.g. an
  "Emergency" job tag). Orange must never compete with the blue.
- **Success green:** `#067647` (on `#ecfdf3`). **Danger red:** `#d92d20` (on `#fef3f2`).
- **Typography:** clean geometric sans-serif (Geist / Inter style). Bold, tight headings;
  comfortable body text.
- **Shape & feel:** rounded corners (cards ~12px, buttons ~10px, pills fully rounded), soft
  hairline borders, generous white space, very subtle shadows, skeleton loaders. Minimal
  animation. Large tap targets. Icons are thin line icons (except a filled verified tick and
  filled stars).
- **Verified tick:** a small filled blue badge/tick shown next to verified artisans.
- **Status colours:** neutral gray pill for draft/closed states, blue for open/active, green for
  completed, orange only for urgent/disputed.

**Navigation shells:**
- Customer & Artisan (consumer apps): top bar with the Deevi logo, a notification bell, and an
  avatar menu; a **bottom tab bar on mobile** (5 tabs) and a **left rail on desktop**.
- Admin (operations console): top bar with logo + "Ops" chip; **left sidebar on desktop**, a
  scrollable tab strip on mobile. Denser, professional, table-like — not a consumer look.

---

## 2. Screen map (the full app)

**Public / Auth**
1. Landing / marketing home
2. Log in
3. Sign up (role picker: customer or artisan)
4. Forgot password

**Customer app** (bottom tabs: Home · My jobs · Post · Messages · Profile)
5. Home / service discovery
6. Category browse
7. Post a job — 5-step wizard (Service → Describe → Location → Details → Review)
8. My jobs (dashboard with status tabs)
9. Job detail + applications review + selection + completion + review
10. Messages — conversation list
11. Conversation thread (chat)
12. Artisan public profile (customer viewing an artisan)
13. Notifications
14. Customer profile (+ saved locations)
15. Settings

**Artisan app** (bottom tabs: For you · Applications · Active · Messages · Profile)
16. Verification gate (pending / under review / rejected / approved states)
17. Onboarding — 4-step wizard (About you → Services → Service areas → Verification/ID upload)
18. Job feed (ranked jobs for approved artisans)
19. Job detail + apply (with an apply form)
20. My applications (tracker with status tabs)
21. Active jobs (accept / start / mark-done lifecycle)
22. Artisan profile (editable) + public preview
23. Notifications · Settings (shared style)

**Admin console** (sidebar: Dashboard · Verification · Users · Jobs · Reports · Catalogue)
24. Operations dashboard (metric tiles)
25. Verification queue
26. Verification detail (review packet, view ID docs, approve/reject/hold)
27. Users list + user detail (suspend/reinstate)
28. Jobs oversight list + job detail
29. Reports queue + report detail (update status)
30. Catalogue management (categories & services CRUD)

---

## 3. Per-screen prompts

### 1 — Landing / marketing home
Design a mobile-first marketing landing page for Deevi. Top: logo left, "Log in" text link and a
blue "Get started" button right. Hero: a pill badge "Verified artisans across Nigeria" with a
small shield icon; a bold headline "Tell us what you need. The right artisan applies." with the
second sentence in Deevi blue; a supporting paragraph about posting a job in your own words. Two
large CTAs: primary blue "Post a job — it's free" and secondary outline "Find work as an artisan".
A small line: "Payment for jobs is arranged directly between you and your artisan — Deevi doesn't
handle the money." Below, a 3-card "How it works" row (Post & get applications, Compare & message,
Hire & review) each with a line icon. Then a section "A few of the services on Deevi" showing 4
grouped cards (Home & repair, Personal & beauty, Moving & delivery, More services) each listing
service names like Plumbing, Electrical, Beauty, Hair, Tailoring, Moving. Footer with logo and
copyright. Clean, trustworthy, lots of white space.

### 2 — Log in
Design a centered mobile login screen for Deevi. Deevi logo at top-left. Heading "Welcome back",
subtext "Log in to your Deevi account." Email field, password field, a right-aligned "Forgot
password?" link, a full-width blue "Log in" button. Below a subtle "New to Deevi? Create an
account" link. Minimal, calm, single column.

### 3 — Sign up
Design a mobile sign-up screen for Deevi. Heading "Create your account". A two-option role picker
as two selectable cards: "I need a service" (search icon) and "I'm an artisan" (wrench icon), the
selected one highlighted with a blue border and light-blue fill. Then first name + last name (two
columns), email, phone (optional), and password (hint: at least 8 characters). Full-width blue
"Create account" button. Link to log in at the bottom.

### 4 — Forgot password
Simple mobile screen: heading "Reset your password", one email field, full-width blue "Send reset
link" button, and a "Back to log in" link. Plus a success variant that says "Check your inbox".

### 5 — Customer home / discovery
Design the Deevi customer home screen, mobile-first. Top app bar: Deevi logo, notification bell,
avatar. A prominent blue hero card with heading "Hi Ada — what you need help with?" and a large
white search input with a search icon and placeholder "e.g. fix my leaking kitchen pipe". Below,
a "Browse services" section grouped into Home & repair, Personal & beauty, Moving & delivery,
More — each group a row of tappable service category cards (name + service count). A "Your recent
jobs" section with 1–3 compact job cards showing title, application count, time, and a status
pill. Bottom tab bar: Home, My jobs, a raised blue circular "Post" (+) button in the middle,
Messages, Profile.

### 6 — Category browse
Design a category screen: back link "All services", a category title (e.g. "Plumbing") and short
description, then a grid of service cards (name, one-line description, optional "From ₦5,000"
price hint, chevron). Tapping a service starts a job post.

### 7 — Post a job (5-step wizard)
Design a mobile multi-step "Post a job" flow for Deevi with a step progress indicator across the
top (5 steps: Service, Describe, Location, Details, Review; completed steps show a blue check).
Show these 5 screens:
- Step 1 Service: "What service do you need?" with a searchable list/grid of service chips/cards,
  selected one highlighted blue.
- Step 2 Describe: fields for Title, a large Details textarea (placeholder describing a leaking
  pipe), and an urgency dropdown (Not urgent / Normal / Urgent / Emergency).
- Step 3 Location: "Where is the job?" with a note that it can differ from the home address;
  optional saved-location chips, then Neighbourhood, City (required), State, private Street
  address, landmark notes, and a "Use current location" button that pins device GPS.
- Step 4 Details: budget type dropdown, from/to naira inputs, preferred start date-time, timing
  notes, extra notes — all optional.
- Step 5 Review: a summary card of everything, a note that the street address stays private until
  an artisan is selected, and two buttons: outline "Save draft" and blue "Publish job".
Bottom of each step: a "Back" ghost button and a blue "Continue" button.

### 8 — My jobs (customer dashboard)
Design the customer "My jobs" screen: heading "My jobs", a small "Post a job" button, a scrollable
row of filter pills (All, Receiving applications, In progress, Completed, Drafts). A list of job
cards: title, urgency tag (orange only if urgent), a status pill, a 2-line description, and a meta
row with location pin, budget, "N applications", and time posted. Include an empty state ("No jobs
yet — post your first job").

### 9 — Job detail + applications (customer) — most important screen
Design the customer job-detail screen for Deevi. Header: status pill + urgency tag, bold job
title, "Service · Posted 2 days ago". A row of meta tiles: Location, Budget, Applications count,
Preferred start. A "Job details" card with the full description. Then the key section:
"Applications (N)" — a list of **application cards**, each showing the artisan's avatar, name /
business name with a blue verified tick, headline, a star rating with count, "12 jobs completed",
years of experience, a status pill; a small grey stats strip (Proposed price, Est. duration,
Applied time); the artisan's pitch message; and an action row: outline "Message", ghost
"Shortlist", ghost "Decline", and a blue "Select artisan" button. Include a confirmation modal
"Select this artisan?" summarizing price and noting payment is arranged directly. Also design the
variants: an "engagement" card once an artisan is selected (their avatar, agreed price, "Message"
and blue "Confirm work complete" buttons), a "Job completed" state with a "Review artisan" button,
and a footer with "Cancel job" and "Report a problem". Empty applications state: "No artisans have
applied yet."

### 10 — Messages (conversation list)
Design a messages list: heading "Messages", a list of conversation rows each with counterparty
avatar, name, last-message preview, timestamp, and an unread count badge in blue. Empty state:
"No conversations yet."

### 11 — Conversation thread (chat)
Design a mobile chat screen: header with back arrow, counterparty avatar, name, and "Re: <job
title>". A scrollable message list with chat bubbles — my messages right-aligned in Deevi blue
with white text, theirs left-aligned white with a border and dark text. A "Load earlier messages"
pill at the top. A bottom composer: a rounded multiline text input and a blue circular send button.

### 12 — Artisan public profile (customer view)
Design the artisan profile a customer sees before hiring: header card with large avatar, name /
business name with blue verified tick, headline, star rating + count, base city; a stats strip
(Jobs completed, Experience years, Availability). An "About" card, a "Services offered" card
(chips with "from ₦…"), a "Works in" card (area chips with pins), and a "Reviews (N)" card listing
star ratings, comments, and dates. A footer line "Identity verified by Deevi".

### 13 — Notifications
Design a notifications screen: heading "Notifications" with a "Mark all read" button. A list of
notification cards; unread ones have a light-blue tint and a blue dot. Each shows a title, body,
and time. Empty state: "You're all caught up."

### 14 — Customer profile
Design the customer profile screen: an identity card (avatar, name, email, phone, "Edit" button)
with a 3-stat strip (Jobs posted, Completed, Your rating with stars). A "Saved locations" section
with an "Add" button and location cards (label, area, a "Default" tag, "Remove"). Include an
"Edit profile" modal and an "Add a location" modal.

### 15 — Settings
Design an account settings screen: a "Change password" card (current, new, confirm fields, blue
"Update password"), and a "Danger zone" card with a red "Deactivate my account" button that opens
a confirmation dialog.

### 16 — Artisan verification gate
Design a centered status screen shown to artisans who aren't approved yet. One card with a shield
icon in a light-blue circle, a status pill, a heading and explanatory paragraph, and a primary
button. Design all four variants: (a) PENDING — "Get verified to start finding work" with a
checklist (Add your services, Set areas, Submit ID) and a blue "Start onboarding" button; (b)
UNDER_REVIEW — clock icon, "Your application is under review"; (c) REJECTED — a red reason box and
an "Update & resubmit" button; (d) SUSPENDED — "Your account is suspended".

### 17 — Artisan onboarding (4-step wizard)
Design a mobile 4-step onboarding wizard for artisans, with a step check indicator. Steps:
- About you: headline, business name, about textarea, years of experience, base city, state.
- Services: "What services do you offer?" — a scrollable list of catalogue categories, each with
  a grid of multi-select service chips (checkbox style, selected = blue). Footer "N selected".
- Service areas: repeatable rows of City + Neighbourhood with "Add another area".
- Verification: a document-type dropdown (NIN, Driver's licence, Passport, CAC, etc.) and an
  "Upload file" button; a list of uploaded documents with a green check and remove; a note that
  documents are private. Final button: "Submit for verification".

### 18 — Artisan job feed (For you)
Design the artisan job feed: heading "Jobs for you", subtext "Ranked by relevance to your services
and area." A search input and a scrollable filter pill row (All jobs, Emergency, Urgent, Normal).
A list of **feed job cards**: a blue service-name pill, an urgency tag and distance ("2.4 km") on
the right, bold title, 2-line description, and a meta row with area pin, budget, "N applied", and
time. Note: the feed shows only the neighbourhood, not the exact address. Empty state about
widening service areas.

### 19 — Artisan job detail + apply
Design the artisan job-detail screen: service pill + urgency, bold title, "Posted 3h ago", meta
tiles (Area, Budget, Preferred start), a "What the customer needs" card with the full description
and timing, and a note that the exact address is shared once selected. A sticky bottom bar with a
blue "Apply for job" button (and an "You've applied" state, and a "not accepting applications"
state). Also design the **Apply modal**: a message-to-customer textarea, your price + price-type,
estimated duration + unit, relevant experience, and a "Send application" button.

### 20 — Artisan applications tracker
Design "My applications": heading, filter pills (All, Submitted, Shortlisted, Won, Closed), and a
list of cards each with the job title, applied time, a status pill, your proposed price, your
pitch preview, and (when shortlisted/submitted) a "Withdraw" action. A "Go to active job →" link
appears on won ones.

### 21 — Artisan active jobs
Design "Active jobs": a list of engagement cards, each with job title, area pin + agreed price, a
status pill, a 2-line description, and a lifecycle action button that changes by state: "Accept
job" + "Decline" (when selected), "Start work" (when accepted), "Mark work done" (when in
progress), and a "Completed" state. Plus a "Message" button. Include confirm dialogs.

### 22 — Artisan profile (editable) + preview
Design the artisan's own profile: a verification-status banner; an identity card (avatar, name,
verified tick, headline, rating, "Edit"); a bio; an availability toggle (Available / Busy /
Unavailable pills); a "Services" card with chips and "Edit"; a "Service areas" card with chips and
"Edit"; and a "Preview" link that shows the public-facing version. Include the edit modals
(profile info, multi-select services, repeatable areas).

### 23 — Admin operations dashboard
Design an operations dashboard for Deevi admins (professional, dense, not consumer). Left sidebar
(Dashboard, Verification, Users, Jobs, Reports, Catalogue) with a "Deevi Ops" logo up top. Main
area: heading "Operations dashboard", a grid of metric tiles (big number + label) — e.g. Total
customers, Total artisans, Pending verification, Active jobs, Completed jobs, Open reports. Below,
a "Jump to" grid of quick-link cards (Verification queue, Reports, Jobs, Users) each with an icon.

### 24 — Admin verification queue
Design the artisan verification queue: heading, status filter pills (Pending, Under review,
Approved, Rejected), and a list of rows: artisan avatar, name/business, base city + "submitted 2d
ago", a verification status pill, and a chevron. Clean, list/table feel.

### 25 — Admin verification detail
Design the verification review screen: a header card with the artisan's avatar, name, headline,
city, submitted date, and status pill; a stats strip (experience, email, phone); a "Submitted
documents" card listing each document type + filename with an "Open" button (opens a secure link);
"Services" and "Areas" chip cards. A sticky bottom decision bar: ghost "Put on hold", red "Reject"
(opens a modal requiring a reason shown to the artisan), and blue "Approve".

### 26 — Admin users
Design the users list: heading, search input, role filter pills (All, Customers, Artisans,
Admins), and rows with avatar, name, email, role tags, and an ACTIVE/SUSPENDED pill. And a user
detail screen: identity card with roles and status, an info grid (joined, email verified, user
id), and a red "Suspend user" (with reason dialog) / "Reinstate user" action.

### 27 — Admin jobs oversight
Design the admin jobs list: heading, search, status filter pills (All, Open, Active, Completed,
Disputed), rows with job title, area + application count + time, and a status pill. And a job
detail screen: title + status, description, meta grid (Location, Budget, Applications), an
applications list, and a vertical lifecycle-history timeline with dots.

### 28 — Admin reports
Design the reports queue: heading, status filter pills (Open, Under review, Resolved, Dismissed),
rows with the report category, reference number + time, and a priority pill (orange for
Urgent/High). And a report detail screen: a card with category, reference, filed date, status
pill, and description; and an "Update report" card with Status and Priority dropdowns, a
"Resolution (shown to the reporter)" textarea, and a "Save update" button.

### 29 — Admin catalogue management
Design the catalogue admin screen: a toggle between "Categories" and "Services". Categories tab:
"New category" button and rows (name, group, an "Inactive" tag if retired, Edit, Retire) with a
create/edit modal (name, group dropdown, description). Services tab: "New service" button and rows
(name, parent category + "from ₦…", Edit, Retire) with a modal (category dropdown, name,
description, typical price from/to).

---

## 4. One-paragraph elevator version (if Stitch wants a single prompt)

Design "Deevi", a mobile-first, trustworthy two-sided local-services marketplace app for Nigeria
where customers post jobs in plain language and verified artisans nearby apply, then the customer
compares applicants, chats, selects one, and reviews them afterwards (Deevi never handles
payment). Use a clean, calm, modern design system: primary Deevi blue #1b47d6 with light-blue
#eef4ff tints, near-black ink #0b1220 headings on #354152 body text, white cards on a soft
off-white #f6f7f9 background, hairline gray borders #e6e9ef and muted text #6b7688, orange #f5820b
used sparingly only for urgency, green #067647 for success and red #d92d20 for errors; rounded
corners, generous whitespace, thin line icons, filled blue verified ticks and filled stars, subtle
shadows, and skeleton loaders. Consumer screens use a bottom tab bar on mobile / left rail on
desktop; the admin console uses a denser left-sidebar operations layout.
