import "server-only";

type ServerEnv = {
  supabaseServiceRoleKey: string;
};

export function getServerEnv(): ServerEnv {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseServiceRoleKey) {
    throw new Error("Missing required server configuration: SUPABASE_SERVICE_ROLE_KEY");
  }

  return { supabaseServiceRoleKey };
}
