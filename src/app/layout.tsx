import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blue.platform"),
  title: {
    default: "B.L.U.E. — Better Living Unites Everyone",
    template: "%s · B.L.U.E.",
  },
  description:
    "B.L.U.E. connects customers with trusted workers and service providers for relocation and everyday service needs. Find trusted help, manage your work, move forward.",
  keywords: [
    "B.L.U.E.",
    "Better Living Unites Everyone",
    "relocation services",
    "service marketplace",
    "workforce platform",
    "find workers",
    "contractors",
    "car washing",
    "individual workers",
  ],
  authors: [{ name: "B.L.U.E. Team" }],
  creator: "B.L.U.E.",
  openGraph: {
    title: "B.L.U.E. — Better Living Unites Everyone",
    description: "Find trusted help. Manage your work. Move forward.",
    url: "https://blue.platform",
    siteName: "B.L.U.E.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "B.L.U.E. — Better Living Unites Everyone",
    description: "Find trusted help. Manage your work. Move forward.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${display.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthSessionProvider>
          <QueryProvider>
            <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
            <Toaster />
            <SonnerToaster />
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
