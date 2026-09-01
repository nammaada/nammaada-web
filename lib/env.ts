type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function requirePublicEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required public configuration: ${name}`);
  }
  return value;
}

export function getPublicEnv(): PublicEnv {
  const supabaseUrl = requirePublicEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = requirePublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  try {
    const parsedUrl = new URL(supabaseUrl);
    if (parsedUrl.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL.");
  }

  return { supabaseUrl, supabaseAnonKey };
}
