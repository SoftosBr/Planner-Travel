import type { Metadata } from "next";
import { TopBar } from "@/components/layout/top-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Spend Planner",
  description: "Plan and calculate your travel expenses by category and currency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <TopBar />
        {children}
      </body>
    </html>
  );
}
