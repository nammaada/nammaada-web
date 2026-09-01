import { redirect } from "next/navigation";
import { getAuthenticatedUser, isAdminUser } from "@/lib/auth/admin";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getAuthenticatedUser();
  if (user && (await isAdminUser(user.id))) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-soft sm:p-9">
        <div className="mb-8">
          <p className="eyebrow">Namma Ada</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-foreground">Admin sign in</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Sign in with the authorized administrator account.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
