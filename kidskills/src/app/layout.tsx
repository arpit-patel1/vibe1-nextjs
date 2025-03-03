import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/contexts/AppProviders";
import { MainNavigation } from "@/components/navigation/MainNavigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "KidSkills - Fun Learning for Kids",
  description: "An interactive learning platform for kids in grades 2-3 to develop skills in math, grammar, English, and leadership.",
  keywords: "kids education, math games, english learning, leadership skills, grade 2, grade 3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${nunito.variable} font-inter bg-light-gray min-h-screen`}>
        <AppProviders>
          <MainNavigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="bg-white py-6 mt-12">
            <div className="container mx-auto px-4 text-center">
              <p className="text-neutral-gray">
                © {new Date().getFullYear()} KidSkills. All rights reserved.
              </p>
              <p className="text-sm text-neutral-gray mt-2">
                Created with ❤️ for young learners
              </p>
            </div>
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}
