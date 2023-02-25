"use client";
import { Providers } from "@/components/Providers";
/* eslint-disable @next/next/no-head-element */

import "../styles/globals.css";
import "../styles/tailwind.css";
import Navbar from "./Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head></head>
      <body>
        <div className="mx-auto">
          <Navbar />
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
