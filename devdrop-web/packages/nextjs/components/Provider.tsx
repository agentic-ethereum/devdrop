"use client";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createIDBPersister, queryClient } from "~~/lib/queryClient";

const persister = createIDBPersister();

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      {children}
    </PersistQueryClientProvider>
  );
};

export default Provider;
