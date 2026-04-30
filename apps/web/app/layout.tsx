import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/app/providers";
import { TopNavbar } from "@/components/top-navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskLoop",
  description: "Escrow rails for open agent work"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <TopNavbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
