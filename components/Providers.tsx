"use client";

import { useState } from "react";
import { WagmiConfig, createClient } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const client = createClient(
  getDefaultClient({
    appName: "limitorders.xyz",
    //infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
    //alchemyId:  process.env.NEXT_PUBLIC_ALCHEMY_ID,
    chains: [mainnet, polygon],
  })
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <WagmiConfig client={client}>
          <ConnectKitProvider>{children}</ConnectKitProvider>
        </WagmiConfig>
      </QueryClientProvider>
    </>
  );
}
