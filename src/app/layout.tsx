import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "taxWallet - Malaysian Tax Relief Wallet",
  description: "Simple tax relief management for the modern Malaysian.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-blue-100 selection:text-blue-900">
          <main className="w-full max-w-[430px] min-h-screen bg-[#F3F8FF] relative shadow-2xl overflow-x-hidden flex flex-col">
            {children}
          </main>
        </div>
        <Toaster position="top-center" expand={false} richColors />
      </body>
    </html>
  );
}
