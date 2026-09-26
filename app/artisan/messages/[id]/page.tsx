"use client";
import { use } from "react";
import { ConversationThread } from "@/components/messaging/ConversationThread";
export default function ArtisanThread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ConversationThread id={id} backHref="/artisan/messages" />;
}
