"use client";

// import { ThemeProvider } from "acme-theme";
// import { AuthProvider } from "acme-auth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // <ThemeProvider>
    //   <AuthProvider>
    <>
    { children }
    </>
    //   </AuthProvider>
    // </ThemeProvider>
  );
}
