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

// Add environment variables to the window object
const envScript = `
  try {
    // Check if window.ENV is already defined (from env.js)
    if (!window.ENV) {
      window.ENV = {
        NEXT_PUBLIC_OPENROUTER_API_KEY: "${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY?.replace(/"/g, '\\"') || process.env.OPENROUTER_API_KEY?.replace(/"/g, '\\"') || ''}",
        NEXT_PUBLIC_DEFAULT_AI_MODEL: "${process.env.NEXT_PUBLIC_DEFAULT_AI_MODEL?.replace(/"/g, '\\"') || 'google/gemini-2.0-pro-exp-02-05:free'}"
      };
    }
    
    console.log("Environment variables loaded:", {
      NEXT_PUBLIC_DEFAULT_AI_MODEL: window.ENV.NEXT_PUBLIC_DEFAULT_AI_MODEL || 'Not set',
      NEXT_PUBLIC_OPENROUTER_API_KEY: window.ENV.NEXT_PUBLIC_OPENROUTER_API_KEY ? 'Set (hidden)' : 'Not set'
    });
    
    // Also store in localStorage as fallback
    if (window.ENV.NEXT_PUBLIC_OPENROUTER_API_KEY) {
      try {
        localStorage.setItem("NEXT_PUBLIC_OPENROUTER_API_KEY", window.ENV.NEXT_PUBLIC_OPENROUTER_API_KEY);
        localStorage.setItem("openrouter_api_key", window.ENV.NEXT_PUBLIC_OPENROUTER_API_KEY);
        console.log("Stored API key in localStorage");
      } catch (e) {
        console.error("Failed to store API key in localStorage:", e);
      }
    }
    
    if (window.ENV.NEXT_PUBLIC_DEFAULT_AI_MODEL) {
      try {
        localStorage.setItem("NEXT_PUBLIC_DEFAULT_AI_MODEL", window.ENV.NEXT_PUBLIC_DEFAULT_AI_MODEL);
        console.log("Stored model in localStorage");
      } catch (e) {
        console.error("Failed to store model in localStorage:", e);
      }
    }
    
    // Also store in cookies as fallback
    if (window.ENV.NEXT_PUBLIC_OPENROUTER_API_KEY) {
      try {
        document.cookie = "NEXT_PUBLIC_OPENROUTER_API_KEY=" + encodeURIComponent(window.ENV.NEXT_PUBLIC_OPENROUTER_API_KEY) + "; path=/; max-age=3600";
        console.log("Stored API key in cookies");
      } catch (e) {
        console.error("Failed to store API key in cookies:", e);
      }
    }
    
    if (window.ENV.NEXT_PUBLIC_DEFAULT_AI_MODEL) {
      try {
        document.cookie = "NEXT_PUBLIC_DEFAULT_AI_MODEL=" + encodeURIComponent(window.ENV.NEXT_PUBLIC_DEFAULT_AI_MODEL) + "; path=/; max-age=3600";
        console.log("Stored model in cookies");
      } catch (e) {
        console.error("Failed to store model in cookies:", e);
      }
    }
  } catch (error) {
    console.error("Error setting up environment variables:", error);
    // Create a fallback ENV object to prevent errors
    window.ENV = {
      NEXT_PUBLIC_OPENROUTER_API_KEY: "",
      NEXT_PUBLIC_DEFAULT_AI_MODEL: "google/gemini-2.0-pro-exp-02-05:free"
    };
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Add viewport meta tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Add script to inject environment variables */}
        <script dangerouslySetInnerHTML={{ __html: envScript }} />
        {/* Include the dynamically generated environment variables script */}
        <script src="/_next/static/chunks/env.js" />
        {/* Ensure CSS is loaded */}
        <link rel="stylesheet" href="/_next/static/css/app/layout.css" />
        <link rel="stylesheet" href="/_next/static/css/app/page.css" />
        {/* Add inline styles for critical CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            font-family: 'Comic Neue', cursive;
            font-size: 18px;
            background-color: rgb(255, 252, 249);
            color: rgb(45, 49, 66);
          }
          .font-inter {
            font-family: var(--font-inter);
          }
          .font-nunito {
            font-family: var(--font-nunito);
          }
          .bg-light-gray {
            background-color: rgb(245, 245, 245);
          }
          .container {
            width: 100%;
            margin-left: auto;
            margin-right: auto;
            padding-left: 1rem;
            padding-right: 1rem;
          }
          @media (min-width: 640px) {
            .container {
              max-width: 640px;
            }
          }
          @media (min-width: 768px) {
            .container {
              max-width: 768px;
            }
          }
          @media (min-width: 1024px) {
            .container {
              max-width: 1024px;
            }
          }
          @media (min-width: 1280px) {
            .container {
              max-width: 1280px;
            }
          }
        ` }} />
      </head>
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
