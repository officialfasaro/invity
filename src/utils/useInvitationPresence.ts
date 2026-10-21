import { useEffect, useState, useRef } from "react";
import { getSupabaseClient } from "./supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseInvitationPresenceVisitorOptions {
  slug?: string;
  guestName?: string;
}

interface UseInvitationPresenceHostOptions {
  slug?: string;
}

/**
 * Hook for guests visiting the invitation page to track their real-time presence.
 * Features dual-mode: 
 * 1. Express In-House Heartbeat (100% Free, zero third-party limits, works on localhost).
 * 2. Supabase Realtime Presence fallback (if configured).
 */
export function useVisitorPresence({ slug, guestName }: UseInvitationPresenceVisitorOptions) {
  useEffect(() => {
    if (!slug) return;

    let visitorId = "";
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("invity_visitor_id");
        if (stored) {
          visitorId = stored;
        } else {
          visitorId = "vis_" + Math.random().toString(36).slice(2, 10);
          sessionStorage.setItem("invity_visitor_id", visitorId);
        }
      } catch {
        visitorId = "vis_" + Math.random().toString(36).slice(2, 10);
      }
    }

    // 1. In-House Express Heartbeat (Guaranteed to work on localhost)
    const sendHeartbeat = () => {
      fetch(`/api/public/invitations/${encodeURIComponent(slug)}/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, guestName }),
      }).catch(() => {});
    };

    // Send immediate heartbeat on mount
    sendHeartbeat();

    // Repeat heartbeat every 15 seconds
    const intervalTimer = setInterval(sendHeartbeat, 15000);

    // On page unload / leave, notify server
    const handleLeave = () => {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ visitorId })], {
          type: "application/json",
        });
        navigator.sendBeacon(`/api/public/invitations/${encodeURIComponent(slug)}/leave`, blob);
      } else {
        fetch(`/api/public/invitations/${encodeURIComponent(slug)}/leave`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId }),
          keepalive: true,
        }).catch(() => {});
      }
    };

    window.addEventListener("beforeunload", handleLeave);

    // 2. Optional Supabase Presence (if Supabase is online)
    const supabase = getSupabaseClient();
    let channel: RealtimeChannel | null = null;

    if (supabase) {
      try {
        const channelName = `invitation_presence_${slug.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
        channel = supabase.channel(channelName, {
          config: {
            presence: {
              key: visitorId,
            },
          },
        });

        channel.subscribe(async (status) => {
          if (status === "SUBSCRIBED" && channel) {
            try {
              await channel.track({
                visitorId,
                guestName: guestName || null,
                onlineAt: new Date().toISOString(),
              });
            } catch {
              // Ignore fallback error
            }
          }
        });
      } catch {
        // Fallback to internal heartbeat
      }
    }

    return () => {
      clearInterval(intervalTimer);
      window.removeEventListener("beforeunload", handleLeave);
      handleLeave();

      if (channel && supabase) {
        channel.untrack().catch(() => {});
        supabase.removeChannel(channel);
      }
    };
  }, [slug, guestName]);
}

/**
 * Hook for the bride/groom dashboard to monitor live active visitors in real-time.
 * Synchronizes with in-house express server and Supabase presence.
 */
export function useHostPresence({ slug }: UseInvitationPresenceHostOptions) {
  const [liveCount, setLiveCount] = useState<number>(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!slug) return;

    // 1. Fetch live count from Express backend (Works on localhost & production)
    const fetchLiveCount = async () => {
      try {
        const res = await fetch(`/api/public/invitations/${encodeURIComponent(slug)}/live`);
        if (res.ok) {
          const json = await res.json();
          if (typeof json.liveCount === "number") {
            setLiveCount(json.liveCount);
          }
        }
      } catch {
        // Fail silently
      }
    };

    // Immediate fetch
    fetchLiveCount();

    // Poll every 4 seconds for responsive real-time updates
    const pollTimer = setInterval(fetchLiveCount, 4000);

    // 2. Optional Supabase Realtime Listener (if online)
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const channelName = `invitation_presence_${slug.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
        const channel = supabase.channel(channelName);
        channelRef.current = channel;

        const updateCount = () => {
          const state = channel.presenceState();
          const activeKeys = Object.keys(state);
          if (activeKeys.length > 0) {
            setLiveCount((prev) => Math.max(prev, activeKeys.length));
          }
        };

        channel
          .on("presence", { event: "sync" }, updateCount)
          .on("presence", { event: "join" }, updateCount)
          .on("presence", { event: "leave" }, updateCount)
          .subscribe();
      } catch {
        // Supabase offline, internal poller will handle
      }
    }

    return () => {
      clearInterval(pollTimer);
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [slug]);

  return slug ? liveCount : 0;
}
