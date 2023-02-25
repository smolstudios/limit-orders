import Navbar from "./Navbar";
import { Providers } from "@/components/Providers";
import "../styles/globals.css";
import "../styles/tailwind.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={"en"}>
      <head></head>
      <body>
        <Providers>
          <div className="mx-auto">
            <Navbar />
            <>
            {children}
            </>
          </div>
        </Providers>
      </body>
    </html>
  );
}
