import "server-only";

type ServerEnv = {
  supabaseServiceRoleKey: string;
};

export type CloudinaryEnv = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export function getServerEnv(): ServerEnv {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseServiceRoleKey) {
    throw new Error("Missing required server configuration: SUPABASE_SERVICE_ROLE_KEY");
  }

  return { supabaseServiceRoleKey };
}

export function getCloudinaryEnv(): CloudinaryEnv {
  const cloudName = getCloudinaryCloudName();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing required server configuration: Cloudinary credentials");
  }
  return { cloudName, apiKey, apiSecret };
}

export function getCloudinaryCloudName() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (!cloudName) throw new Error("Missing required server configuration: CLOUDINARY_CLOUD_NAME");
  return cloudName;
}
