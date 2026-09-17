"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, LogIn, UserPlus, Package, LogOut, ShieldCheck } from "lucide-react";
import { useCustomerAuth } from "@/lib/auth/customer-context";

type AccountAvatarDropdownProps = {
  isCreamNavbar?: boolean;
  className?: string;
};

export function AccountAvatarDropdown({ isCreamNavbar = false, className = "" }: AccountAvatarDropdownProps) {
  const { user, profile, loading, signOut } = useCustomerAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  function closeDropdown() {
    setIsOpen(false);
  }

  const isLoggedIn = Boolean(user);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* AVATAR TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={isLoggedIn ? `Account menu for ${profile?.fullName || "user"}` : "Account options"}
        className={`relative inline-flex min-h-10 min-w-10 sm:min-h-11 sm:min-w-11 items-center justify-center rounded-full text-[#711e2c] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 cursor-pointer ${
          isCreamNavbar
            ? "border border-[#e5d8c6] bg-white/80 shadow-xs hover:bg-white"
            : "border border-white/60 bg-white/40 shadow-xs hover:bg-white/65 hover:border-white/80"
        } ${isOpen ? "ring-2 ring-[#711e2c]/30" : ""}`}
      >
        {profile?.avatarUrl ? (
          <div className="relative size-7 sm:size-8 overflow-hidden rounded-full border border-[#e5d8c6]">
            <Image
              src={profile.avatarUrl}
              alt={profile.fullName || "Customer avatar"}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            <User aria-hidden="true" size={18} className="text-[#711e2c]" />
            {isLoggedIn && (
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-600 ring-2 ring-white"
              />
            )}
          </div>
        )}
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2 w-56 sm:w-64 origin-top-right rounded-2xl border border-[#e5d8c6] bg-[#fffdf8] p-1.5 shadow-[0_16px_35px_-8px_rgba(43,23,25,0.18),0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {loading ? (
            <div className="px-4 py-3 text-xs text-[#6e5b55] animate-pulse">Loading account...</div>
          ) : isLoggedIn ? (
            /* AUTHENTICATED CUSTOMER MENU */
            <div className="space-y-1">
              <div className="border-b border-[#eedec8] px-3.5 py-2.5">
                <p className="text-xs font-semibold text-[#6e5b55] uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-bold text-[#2b1719] truncate">{profile?.fullName}</p>
                {profile?.email && (
                  <p className="text-xs text-[#6e5b55] truncate font-mono">{profile.email}</p>
                )}
              </div>

              <div className="py-1">
                <Link
                  href="/account"
                  onClick={closeDropdown}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-[#2b1719] hover:bg-[#f4efeb] hover:text-[#711e2c] transition-colors"
                  role="menuitem"
                >
                  <User size={16} className="text-[#711e2c]" />
                  <span>My Account</span>
                </Link>

                <Link
                  href="/account/orders"
                  onClick={closeDropdown}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-[#2b1719] hover:bg-[#f4efeb] hover:text-[#711e2c] transition-colors"
                  role="menuitem"
                >
                  <Package size={16} className="text-[#711e2c]" />
                  <span>My Orders</span>
                </Link>
              </div>

              <div className="border-t border-[#eedec8] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    closeDropdown();
                    signOut();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
                  role="menuitem"
                >
                  <LogOut size={16} className="text-red-700" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            /* UNAUTHENTICATED GUEST MENU */
            <div className="space-y-1">
              <div className="border-b border-[#eedec8] px-3.5 py-2.5">
                <p className="text-xs font-bold text-[#711e2c] uppercase tracking-wider">Welcome</p>
                <p className="text-xs text-[#6e5b55] mt-0.5">
                  Sign in or create an account to view your past orders.
                </p>
              </div>

              <div className="py-1 space-y-0.5">
                <Link
                  href="/account/login"
                  onClick={closeDropdown}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-[#2b1719] hover:bg-[#f4efeb] hover:text-[#711e2c] transition-colors"
                  role="menuitem"
                >
                  <LogIn size={16} className="text-[#711e2c]" />
                  <span>Sign In</span>
                </Link>

                <Link
                  href="/account/register"
                  onClick={closeDropdown}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-[#711e2c] bg-[#711e2c]/8 hover:bg-[#711e2c]/15 transition-colors"
                  role="menuitem"
                >
                  <UserPlus size={16} className="text-[#711e2c]" />
                  <span>Create Account</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
