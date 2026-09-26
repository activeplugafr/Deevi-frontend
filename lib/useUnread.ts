"use client";

import { messagesApi } from "@/lib/api";
import { useAsync } from "@/lib/hooks";

/** Total unread messages for the nav badge. Degrades to 0 on any error. */
export function useUnreadMessages(): number {
  const { data } = useAsync(async () => {
    try {
      return await messagesApi.unreadCount();
    } catch {
      return { count: 0 };
    }
  }, []);
  return data?.count ?? data?.unread ?? data?.total ?? 0;
}
