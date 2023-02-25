"use client";

// import { ThemeProvider } from "acme-theme";
// import { AuthProvider } from "acme-auth";

import { WagmiConfig, createClient } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import { ConnectKitProvider, getDefaultClient } from "connectkit";

const client = createClient(
  getDefaultClient({
    appName: "ConnectKit Next.js demo",
    //infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
    //alchemyId:  process.env.NEXT_PUBLIC_ALCHEMY_ID,
    chains: [mainnet, polygon, optimism, arbitrum],
  })
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WagmiConfig client={client}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}
