"use client";

/**
 * Renders the current year on the client side.
 * With cacheComponents enabled, new Date() in server components triggers a
 * prerendering warning. Wrapping in a "use client" component avoids this.
 */
export function CopyrightYear() {
  return <>{new Date().getFullYear()}</>;
}
