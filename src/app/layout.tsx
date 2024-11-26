import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "shobu",
  description: "sho your bu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen p-0">
        {children}
      </body>
    </html>
  );
}
