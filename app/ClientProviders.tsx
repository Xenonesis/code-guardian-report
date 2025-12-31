"use client";

import { Providers } from "./providers";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return <Providers>{children}</Providers>;
}
