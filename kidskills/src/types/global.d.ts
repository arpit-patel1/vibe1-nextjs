// Global type declarations

interface Window {
  ENV?: {
    NEXT_PUBLIC_OPENROUTER_API_KEY?: string;
    NEXT_PUBLIC_DEFAULT_AI_MODEL?: string;
    [key: string]: string | undefined;
  };
} 