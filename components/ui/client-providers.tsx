"use client";

import { CustomCursor } from "@/components/ui/custom-cursor";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomCursor />
      {children}
    </>
  );
}
