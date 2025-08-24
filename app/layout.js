import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
import { Toaster } from "sonner";


export const metadata = {
  title: "Cloud Vault",
  description: "Cloud Vault - The only storage solution you need",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      ><Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}
