import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KoinaHQ — The Operating System for Borderless Companies",
  description:
    "Form your company, hire your team, open your office, and get paid — all in one place, from anywhere in the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
