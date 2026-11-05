"use client";

import { createContext, useContext, type ReactNode } from "react";

export type AppContextValue = {
  profile: {
    name: string;
    allUrls: Set<string>;
  };
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppContextProvider({
  value,
  children,
}: {
  value: AppContextValue;
  children: ReactNode;
}) {
  return <AppContext value={value}>{children}</AppContext>;
}

export function useAppContext(): AppContextValue {
  const val = useContext(AppContext);
  if (!val) {
    throw new Error(
      "Consumer of useAppContext must be descendant of <AppContextProvider>.",
    );
  }

  return val;
}
