"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth/admin";

export type LoginState = {
  message?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};

function readText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = readText(formData.get("email")).toLowerCase();
  const password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";
  const fieldErrors: LoginState["fieldErrors"] = {};

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (!password) {
    fieldErrors.password = "Enter your password.";
  }
  if (fieldErrors.email || fieldErrors.password) {
    return { fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user || !(await isAdminUser(data.user.id))) {
    await supabase.auth.signOut();
    return { message: "Unable to sign in with these credentials." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
