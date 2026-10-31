"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

// REQ-1: a session ends after 30 minutes without activity.
// (Clerk's own inactivity timeout is a paid feature, so Fiscora does it here.)
const TIMEOUT_MS = 30 * 60 * 1000;
const KEY = "fiscora-last-activity";
const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

const read = () => {
  try {
    return Number(localStorage.getItem(KEY)) || Date.now();
  } catch {
    return Date.now();
  }
};
const write = (t) => {
  try {
    localStorage.setItem(KEY, String(t)); // shared by every open tab
  } catch {}
};

export function SessionTimeout() {
  const { signOut } = useClerk();

  useEffect(() => {
    let last = Date.now();
    write(last);

    const onActivity = () => {
      const now = Date.now();
      if (now - last > 15000) {
        last = now;
        write(now);
      }
    };
    EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const timer = setInterval(() => {
      if (Date.now() - Math.max(last, read()) >= TIMEOUT_MS) {
        clearInterval(timer);
        signOut({ redirectUrl: "/sign-in" });
      }
    }, 30000);

    return () => {
      clearInterval(timer);
      EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [signOut]);

  return null;
}
