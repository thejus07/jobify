import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Jobify - Early Career Tech Jobs, Internships & AI Career Preparation",
  description:
    "Discover verified tech internships and new graduate full-time roles, practice daily technical interview questions, and tailor your resume with AI. Made by Pixelmind (pixelmind.co.in).",
  keywords: [
    "Jobify",
    "Pixelmind",
    "internships",
    "software engineering internships",
    "early career",
    "new grad jobs",
    "coding practice",
    "resume tailor",
    "tech careers",
  ],
};

import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-[#0071e3]/20 selection:text-[#1d1d1f]">
        <Suspense fallback={<div className="h-14 w-full apple-glass" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
