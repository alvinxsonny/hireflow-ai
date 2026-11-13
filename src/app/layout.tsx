import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "HireFlow AI | Smarter Hiring. Seamless Onboarding.",
  description:
    "AI-powered recruitment and employee onboarding platform that streamlines resume screening, assessments, interviews, approvals, and document verification.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>
          <div className="min-h-screen flex flex-col bg-slate-50/50">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
