"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight, Sparkles } from "lucide-react";
import type { StorefrontProduct } from "@/lib/storefront/products";

const POPULAR_SUGGESTIONS = [
  "Palada Payasam",
  "Coconut Oil",
  "Unniyappam",
  "Chips",
  "Pickles",
];

export function ProductSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Focus input when opened and lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Real-time search effect with debounce
  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      return;
    }

    setLoading(true);
    setHasSearched(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("[Search Error]:", err);
        }
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [query]);

  function handleSelectProduct(slug: string) {
    onClose();
    startTransition(() => {
      router.push(`/products/${slug}`);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (results.length > 0) {
      // Navigate to top match
      handleSelectProduct(results[0].slug);
    } else {
      // Navigate to catalog with search param
      onClose();
      startTransition(() => {
        router.push(`/products?search=${encodeURIComponent(trimmed)}`);
      });
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:pt-20 bg-black/50 backdrop-blur-sm [transform:translateZ(0)] animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
    >
      <div
        className="relative w-full max-w-xl rounded-2xl sm:rounded-3xl border border-[#e5d8c6] bg-[#fffdfa] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-3 border-b border-[#e5d8c6] px-4 sm:px-5 py-3.5 bg-[#fbf7ef]"
        >
          <Search className="shrink-0 text-[#711e2c]" size={20} />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search delicacies by name..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-[#2b1719] placeholder:text-[#2b1719]/45 outline-none"
            aria-label="Search delicacies"
          />

          {loading ? (
            <Loader2 className="shrink-0 animate-spin text-[#711e2c]/70" size={18} />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="shrink-0 rounded-full p-1 text-[#2b1719]/40 hover:text-[#711e2c] hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="shrink-0 inline-flex items-center justify-center rounded-full h-8 px-3 text-xs font-semibold text-[#711e2c] hover:bg-[#711e2c]/10 transition-colors cursor-pointer"
          >
            Close
          </button>
        </form>

        {/* Search Body / Results Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Default state: Popular Suggestions */}
          {!query.trim() && (
            <div className="py-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#711e2c]/80 mb-3">
                <Sparkles size={14} />
                <span>Popular Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setQuery(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="inline-flex items-center rounded-full border border-[#711e2c]/15 bg-[#f5eee6] hover:bg-[#ebdccf] hover:border-[#711e2c]/30 px-3.5 py-1.5 text-xs font-medium text-[#2b1719] transition-all cursor-pointer active:scale-95"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {query.trim() && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#711e2c]/75 px-1">
                Found {results.length} {results.length === 1 ? "delicacy" : "delicacies"}
              </p>
              <div className="divide-y divide-[#711e2c]/10 rounded-2xl border border-[#711e2c]/15 bg-white/70 overflow-hidden">
                {results.map((product) => {
                  const price = (product.price_paise / 100).toFixed(0);
                  const imageUrl = product.primary_image?.url || "/bg-image-aada.png";

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectProduct(product.slug)}
                      className="group flex w-full items-center gap-3.5 p-3 text-left transition-colors hover:bg-[#fbf5ed] cursor-pointer"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#711e2c]/15 bg-[#f4efeb]">
                        <Image
                          src={imageUrl}
                          alt={product.primary_image?.alt || product.name}
                          fill
                          sizes="48px"
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#2b1719] group-hover:text-[#711e2c] transition-colors truncate">
                          {product.name}
                        </h4>
                        {product.short_description ? (
                          <p className="text-xs text-[#6e5b55] truncate mt-0.5">
                            {product.short_description}
                          </p>
                        ) : null}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-[#711e2c]">
                          ₹{price}
                        </p>
                        <span className="text-[10px] font-medium text-emerald-700">
                          {product.is_in_stock ? "In Stock" : "Pre-order"}
                        </span>
                      </div>

                      <ArrowRight
                        size={15}
                        className="text-[#711e2c]/40 group-hover:text-[#711e2c] group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No results message */}
          {hasSearched && !loading && results.length === 0 && (
            <div className="py-8 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#711e2c]/10 text-[#711e2c]">
                <Search size={22} />
              </div>
              <h4 className="text-sm sm:text-base font-semibold text-[#2b1719]">
                No products found
              </h4>
              <p className="text-xs sm:text-sm text-[#6e5b55] max-w-sm mx-auto">
                We couldn&apos;t find any delicacies matching &ldquo;{query}&rdquo;. Try searching for Payasam, Oil, Unniyappam, or Chips.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#e5d8c6] bg-[#fbf7ef] px-4 py-2.5 flex items-center justify-between text-[11px] text-[#6e5b55]">
          <span>
            Tip: Press <kbd className="rounded bg-white px-1.5 py-0.5 border border-[#e5d8c6] text-[#2b1719] font-mono">Enter</kbd> to view
          </span>
          <Link
            href="/products"
            onClick={onClose}
            className="font-semibold text-[#711e2c] hover:underline"
          >
            Browse all products →
          </Link>
        </div>
      </div>
    </div>
  );
}
