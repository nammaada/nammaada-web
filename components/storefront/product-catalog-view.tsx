"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Check, RotateCcw, ChevronDown, Layers } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import type { StorefrontCategory } from "@/lib/storefront/categories";
import type { StorefrontProduct } from "@/lib/storefront/products";

type PriceRangeKey = "all" | "under-100" | "100-200" | "above-200";
type SortOptionKey = "featured" | "price-asc" | "price-desc" | "name-asc";

const PRICE_RANGES: { id: PriceRangeKey; label: string; minPaise?: number; maxPaise?: number }[] = [
  { id: "all", label: "All Prices" },
  { id: "under-100", label: "Under ₹100", maxPaise: 9999 },
  { id: "100-200", label: "₹100 – ₹200", minPaise: 10000, maxPaise: 20000 },
  { id: "above-200", label: "Above ₹200", minPaise: 20001 },
];

const SORT_OPTIONS: { id: SortOptionKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name-asc", label: "Name: A to Z" },
];

export function ProductCatalogView({
  categories,
  initialProducts,
}: {
  categories: StorefrontCategory[];
  initialProducts: StorefrontProduct[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial values from URL query if available
  const initialCategory = searchParams?.get("category") || "all";
  const initialPrice = (searchParams?.get("price") as PriceRangeKey) || "all";
  const initialSort = (searchParams?.get("sort") as SortOptionKey) || "featured";
  const searchQuery = searchParams?.get("search") || searchParams?.get("q") || "";

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(initialCategory);
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRangeKey>(initialPrice);
  const [selectedSort, setSelectedSort] = useState<SortOptionKey>(initialSort);

  // Desktop dropdown open states
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Mobile modal states
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [mobileModalTab, setMobileModalTab] = useState<"category" | "filters">("category");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and prevent background swiping when mobile filter modal is open
  useEffect(() => {
    if (!isMobileFilterOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.body.style.touchAction = "none";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileFilterOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileFilterOpen]);

  const priceRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close desktop dropdowns on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (priceRef.current && !priceRef.current.contains(event.target as Node)) {
        setPriceDropdownOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPriceDropdownOpen(false);
        setSortDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Sync state with URL without full page reload
  function updateQuery(category: string, price: string, sort: string) {
    const params = new URLSearchParams();
    if (category && category !== "all") params.set("category", category);
    if (price && price !== "all") params.set("price", price);
    if (sort && sort !== "featured") params.set("sort", sort);
    if (searchQuery) params.set("search", searchQuery);

    const queryStr = params.toString();
    const newPath = queryStr ? `/products?${queryStr}` : "/products";
    router.replace(newPath, { scroll: false });
  }

  function handleCategoryChange(slug: string) {
    setSelectedCategorySlug(slug);
    updateQuery(slug, selectedPriceRange, selectedSort);
  }

  function handlePriceChange(range: PriceRangeKey) {
    setSelectedPriceRange(range);
    updateQuery(selectedCategorySlug, range, selectedSort);
  }

  function handleSortChange(sort: SortOptionKey) {
    setSelectedSort(sort);
    updateQuery(selectedCategorySlug, selectedPriceRange, sort);
  }

  function handleResetFilters() {
    setSelectedCategorySlug("all");
    setSelectedPriceRange("all");
    setSelectedSort("featured");
    updateQuery("all", "all", "featured");
    setPriceDropdownOpen(false);
    setSortDropdownOpen(false);
    setIsMobileFilterOpen(false);
  }

  // Calculate product counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialProducts.length };
    categories.forEach((cat) => {
      counts[cat.slug] = initialProducts.filter((p) => p.category_id === cat.id).length;
    });
    return counts;
  }, [categories, initialProducts]);

  // Selected category object
  const activeCategory = categories.find((c) => c.slug === selectedCategorySlug);

  // Filter & Sort products
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // 0. Search term filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          if (!product.name.toLowerCase().includes(q)) return false;
        }

        // 1. Category filter
        if (selectedCategorySlug !== "all") {
          if (!activeCategory || product.category_id !== activeCategory.id) return false;
        }

        // 2. Price filter
        if (selectedPriceRange === "under-100" && product.price_paise >= 10000) return false;
        if (selectedPriceRange === "100-200" && (product.price_paise < 10000 || product.price_paise > 20000)) return false;
        if (selectedPriceRange === "above-200" && product.price_paise <= 20000) return false;

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === "price-asc") return a.price_paise - b.price_paise;
        if (selectedSort === "price-desc") return b.price_paise - a.price_paise;
        if (selectedSort === "name-asc") return a.name.localeCompare(b.name);
        return a.display_order - b.display_order;
      });
  }, [initialProducts, searchQuery, selectedCategorySlug, activeCategory, selectedPriceRange, selectedSort]);

  function handleClearSearch() {
    const params = new URLSearchParams();
    if (selectedCategorySlug && selectedCategorySlug !== "all") params.set("category", selectedCategorySlug);
    if (selectedPriceRange && selectedPriceRange !== "all") params.set("price", selectedPriceRange);
    if (selectedSort && selectedSort !== "featured") params.set("sort", selectedSort);
    const queryStr = params.toString();
    router.replace(queryStr ? `/products?${queryStr}` : "/products", { scroll: false });
  }

  // Active filters count for mobile indicator badge
  const activeFilterCount =
    (selectedCategorySlug !== "all" ? 1 : 0) +
    (selectedPriceRange !== "all" ? 1 : 0) +
    (selectedSort !== "featured" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const currentPriceLabel = PRICE_RANGES.find((r) => r.id === selectedPriceRange)?.label || "All Prices";
  const currentSortLabel = SORT_OPTIONS.find((s) => s.id === selectedSort)?.label || "Featured";

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------- */}
      {/* 1. DESKTOP ONLY: UNIFIED ONE-LINE FILTER BAR                  */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden sm:flex sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#e5d8c6]">
        {/* Category Navigation Pills */}
        <nav
          aria-label="Product categories"
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 min-w-0 flex-1"
        >
          {/* All Products Pill */}
          <button
            type="button"
            onClick={() => handleCategoryChange("all")}
            className={`h-[38px] shrink-0 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-3.5 sm:px-4 text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              selectedCategorySlug === "all"
                ? "border-[#711e2c] bg-[#711e2c] text-[#fffcf2] shadow-[0_6px_16px_-4px_rgba(113,30,44,0.35)] backdrop-blur-md"
                : "border-white/60 bg-gradient-to-br from-white/65 via-[#fcf7ee]/40 to-[#f5e8d5]/25 backdrop-blur-md shadow-[0_4px_12px_-2px_rgba(43,23,25,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.85)] text-[#711e2c] hover:border-white/80 hover:bg-white/75 hover:shadow-md"
            }`}
          >
            <span>All Products</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                selectedCategorySlug === "all" ? "bg-white/20 text-white" : "bg-[#711e2c]/10 text-[#711e2c]"
              }`}
            >
              {categoryCounts["all"] || 0}
            </span>
          </button>

          {/* Specific Category Pills (PAYASAM, OIL, UNNIYAPPAM, CHIPS, PICKLES) */}
          {categories.map((category) => {
            const isSelected = selectedCategorySlug === category.slug;
            const count = categoryCounts[category.slug] || 0;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryChange(category.slug)}
                className={`h-[38px] shrink-0 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-3.5 sm:px-4 text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  isSelected
                    ? "border-[#711e2c] bg-[#711e2c] text-[#fffcf2] shadow-[0_6px_16px_-4px_rgba(113,30,44,0.35)] backdrop-blur-md"
                    : "border-white/60 bg-gradient-to-br from-white/65 via-[#fcf7ee]/40 to-[#f5e8d5]/25 backdrop-blur-md shadow-[0_4px_12px_-2px_rgba(43,23,25,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.85)] text-[#711e2c] hover:border-white/80 hover:bg-white/75 hover:shadow-md"
                }`}
              >
                <span>{category.name}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                    isSelected ? "bg-white/20 text-white" : "bg-[#711e2c]/10 text-[#711e2c]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Filter Controls: Price Dropdown + Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Price Range Dropdown */}
          <div className="relative" ref={priceRef}>
            <button
              type="button"
              id="price-filter-button"
              aria-haspopup="listbox"
              aria-expanded={priceDropdownOpen}
              onClick={() => {
                setPriceDropdownOpen((prev) => !prev);
                setSortDropdownOpen(false);
              }}
              className={`h-[38px] inline-flex items-center justify-between gap-2 rounded-full border px-3.5 sm:px-4 text-xs sm:text-[13px] font-semibold transition-all duration-150 cursor-pointer select-none ${
                selectedPriceRange !== "all" || priceDropdownOpen
                  ? "border-[#711e2c] bg-white text-[#711e2c] ring-2 ring-[#711e2c]/10 shadow-sm"
                  : "border-white/60 bg-gradient-to-br from-white/65 via-[#fcf7ee]/40 to-[#f5e8d5]/25 backdrop-blur-md shadow-[0_4px_12px_-2px_rgba(43,23,25,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.85)] text-[#2b1719] hover:border-white/80 hover:bg-white/75 hover:text-[#711e2c]"
              }`}
            >
              <span className="truncate">{currentPriceLabel}</span>
              <ChevronDown
                size={14}
                className={`shrink-0 text-[#711e2c] transition-transform duration-200 ${
                  priceDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {priceDropdownOpen && (
              <div
                role="listbox"
                aria-label="Filter by price"
                className="absolute right-0 top-full mt-1.5 z-40 w-48 rounded-2xl border border-white/60 bg-[#fffdf8]/95 backdrop-blur-xl p-1.5 shadow-xl shadow-amber-950/10 animate-in fade-in zoom-in-95 duration-150"
              >
                {PRICE_RANGES.map((range) => {
                  const isSelected = selectedPriceRange === range.id;
                  return (
                    <button
                      key={range.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        handlePriceChange(range.id);
                        setPriceDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-[#711e2c] text-[#fffcf2]"
                          : "text-[#2b1719] hover:bg-[#f4efeb] hover:text-[#711e2c]"
                      }`}
                    >
                      <span>{range.label}</span>
                      {isSelected && <Check size={14} className="text-[#fffcf2] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              id="sort-filter-button"
              aria-haspopup="listbox"
              aria-expanded={sortDropdownOpen}
              onClick={() => {
                setSortDropdownOpen((prev) => !prev);
                setPriceDropdownOpen(false);
              }}
              className={`h-[38px] inline-flex items-center justify-between gap-2 rounded-full border px-3.5 sm:px-4 text-xs sm:text-[13px] font-semibold transition-all duration-150 cursor-pointer select-none ${
                selectedSort !== "featured" || sortDropdownOpen
                  ? "border-[#711e2c] bg-white text-[#711e2c] ring-2 ring-[#711e2c]/10 shadow-sm"
                  : "border-white/60 bg-gradient-to-br from-white/65 via-[#fcf7ee]/40 to-[#f5e8d5]/25 backdrop-blur-md shadow-[0_4px_12px_-2px_rgba(43,23,25,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.85)] text-[#2b1719] hover:border-white/80 hover:bg-white/75 hover:text-[#711e2c]"
              }`}
            >
              <span className="truncate">Sort: {currentSortLabel}</span>
              <ChevronDown
                size={14}
                className={`shrink-0 text-[#711e2c] transition-transform duration-200 ${
                  sortDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sortDropdownOpen && (
              <div
                role="listbox"
                aria-label="Sort products"
                className="absolute right-0 top-full mt-1.5 z-40 w-52 rounded-2xl border border-white/60 bg-[#fffdf8]/95 backdrop-blur-xl p-1.5 shadow-xl shadow-amber-950/10 animate-in fade-in zoom-in-95 duration-150"
              >
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = selectedSort === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        handleSortChange(opt.id);
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-[#711e2c] text-[#fffcf2]"
                          : "text-[#2b1719] hover:bg-[#f4efeb] hover:text-[#711e2c]"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={14} className="text-[#fffcf2] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. MOBILE ONLY: EXACT ORIGINAL MOBILE PRODUCT PAGE CONTROLS   */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3 pb-2 border-b border-[#e5d8c6] sm:hidden">
        {/* MOBILE: Title & Delicacies Count at the top */}
        <div className="text-center space-y-0.5 pt-1">
          <h2 className="font-display text-lg font-bold text-[#711e2c]">
            {activeCategory ? activeCategory.name : "All Products"}
          </h2>
          <p className="text-xs text-[#6e5b55]">
            ({filteredProducts.length} {filteredProducts.length === 1 ? "delicacy" : "delicacies"})
          </p>
        </div>

        {/* MOBILE: Two buttons side by side in one row */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Left Button: Category Selector */}
          <button
            type="button"
            onClick={() => {
              setMobileModalTab("category");
              setIsMobileFilterOpen(true);
            }}
            className="inline-flex min-h-11 items-center justify-between gap-1.5 rounded-full border border-white/60 bg-gradient-to-br from-white/65 via-[#fcf7ee]/40 to-[#f5e8d5]/25 backdrop-blur-md px-4 text-xs font-semibold text-[#711e2c] shadow-[0_4px_12px_-2px_rgba(43,23,25,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.85)] active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Layers size={14} className="shrink-0 text-[#711e2c]" />
              <span className="truncate">{activeCategory ? activeCategory.name : "All Products"}</span>
            </div>
            <ChevronDown size={14} className="shrink-0 text-[#711e2c]/70" />
          </button>

          {/* Right Button: Filters & Sort */}
          <button
            type="button"
            onClick={() => {
              setMobileModalTab("filters");
              setIsMobileFilterOpen(true);
            }}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/60 bg-gradient-to-br from-white/65 via-[#fcf7ee]/40 to-[#f5e8d5]/25 backdrop-blur-md px-3.5 text-xs font-semibold text-[#711e2c] shadow-[0_4px_12px_-2px_rgba(43,23,25,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.85)] active:scale-98 cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>Filters & Sort</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-[#711e2c] px-1.5 py-0.2 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. ACTIVE FILTER CHIPS (IF ANY) */}
      {/* ------------------------------------------------------------- */}
      {(selectedCategorySlug !== "all" || selectedPriceRange !== "all" || selectedSort !== "featured" || searchQuery.trim().length > 0) && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-xs font-bold text-[#6e5b55]">Active:</span>

          {searchQuery.trim() && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f4efeb] border border-[#e5d8c6] px-3 py-1 text-xs font-semibold text-[#711e2c] hover:bg-[#eedec8] transition-colors cursor-pointer"
            >
              <span>Search: &ldquo;{searchQuery}&rdquo;</span>
              <X size={13} />
            </button>
          )}

          {selectedCategorySlug !== "all" && activeCategory && (
            <button
              type="button"
              onClick={() => handleCategoryChange("all")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f4efeb] border border-[#e5d8c6] px-3 py-1 text-xs font-semibold text-[#711e2c] hover:bg-[#eedec8] transition-colors cursor-pointer"
            >
              <span>Category: {activeCategory.name}</span>
              <X size={13} />
            </button>
          )}

          {selectedPriceRange !== "all" && (
            <button
              type="button"
              onClick={() => handlePriceChange("all")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f4efeb] border border-[#e5d8c6] px-3 py-1 text-xs font-semibold text-[#711e2c] hover:bg-[#eedec8] transition-colors cursor-pointer"
            >
              <span>Price: {PRICE_RANGES.find((r) => r.id === selectedPriceRange)?.label}</span>
              <X size={13} />
            </button>
          )}

          {selectedSort !== "featured" && (
            <button
              type="button"
              onClick={() => handleSortChange("featured")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f4efeb] border border-[#e5d8c6] px-3 py-1 text-xs font-semibold text-[#711e2c] hover:bg-[#eedec8] transition-colors cursor-pointer"
            >
              <span>Sort: {SORT_OPTIONS.find((s) => s.id === selectedSort)?.label}</span>
              <X size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              handleResetFilters();
              if (searchQuery) handleClearSearch();
            }}
            className="text-xs font-bold text-[#711e2c] underline hover:text-[#5a1723] ml-1 cursor-pointer"
          >
            Reset all
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. PRODUCT GRID (2 PER ROW ON MOBILE, 2 ON TABLET, 3 ON LG)   */}
      {/* ------------------------------------------------------------- */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-[#e5d8c6] bg-[#fffdf8] p-8 sm:p-12 text-center shadow-soft">
          <p className="eyebrow">NO DELICACIES FOUND</p>
          <h3 className="mt-2 font-display text-xl sm:text-2xl font-semibold text-[#2b1719]">
            No products match your selected filters.
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#6e5b55] max-w-md mx-auto">
            Try choosing a different category or adjusting the price range to explore more delicacies.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#711e2c] px-6 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#5a1723] active:scale-98 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Show All Products</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} index={index} product={product} />
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. MOBILE FILTER MODAL / BOTTOM SHEET WITH CATEGORY & FILTERS */}
      {/* ------------------------------------------------------------- */}
      {mounted && isMobileFilterOpen && createPortal(
        <div
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-50 sm:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs h-[100dvh] w-screen overscroll-contain animate-in fade-in duration-200"
          style={{ touchAction: "none" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMobileFilterOpen(false);
          }}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault();
            }
          }}
        >
          <div
            className="bg-[#fbf7ef] rounded-t-3xl max-h-[85dvh] flex flex-col shadow-2xl border-t border-[#e5d8c6] animate-in slide-in-from-bottom duration-300 w-full overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
            style={{ overscrollBehavior: "contain", touchAction: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Title & Close */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e5d8c6] shrink-0 bg-[#fbf7ef]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#711e2c]" />
                <h3 className="font-display text-lg font-bold text-[#711e2c]">Filter Delicacies</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="size-8 rounded-full flex items-center justify-center text-[#6e5b55] hover:bg-[#f4efeb] cursor-pointer"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs: Category / Price & Sort */}
            <div className="flex border-b border-[#e5d8c6] bg-white/60 px-5 pt-2 shrink-0">
              <button
                type="button"
                onClick={() => setMobileModalTab("category")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  mobileModalTab === "category"
                    ? "border-[#711e2c] text-[#711e2c]"
                    : "border-transparent text-[#6e5b55] hover:text-[#711e2c]"
                }`}
              >
                Category ({selectedCategorySlug === "all" ? "All" : activeCategory?.name || "1"})
              </button>
              <button
                type="button"
                onClick={() => setMobileModalTab("filters")}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  mobileModalTab === "filters"
                    ? "border-[#711e2c] text-[#711e2c]"
                    : "border-transparent text-[#6e5b55] hover:text-[#711e2c]"
                }`}
              >
                <span>Price & Sort</span>
                {(selectedPriceRange !== "all" || selectedSort !== "featured") && (
                  <span className="size-2 rounded-full bg-[#711e2c]" />
                )}
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              className="overflow-y-auto p-5 space-y-5 flex-1 overscroll-contain"
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                touchAction: "pan-y",
              }}
            >
              {mobileModalTab === "category" ? (
                /* Category Selection Tab */
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-[#6e5b55] mb-2">Select a category to view:</p>
                  
                  {/* All Products Option */}
                  <button
                    type="button"
                    onClick={() => {
                      handleCategoryChange("all");
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategorySlug === "all"
                        ? "border-[#711e2c] bg-[#711e2c] text-white shadow-xs"
                        : "border-[#e5d8c6] bg-white text-[#2b1719]"
                    }`}
                  >
                    <span className="font-bold">All Products</span>
                    <span
                      className={`text-[11px] rounded-full px-2 py-0.5 font-bold ${
                        selectedCategorySlug === "all" ? "bg-white/25 text-white" : "bg-[#f4efeb] text-[#711e2c]"
                      }`}
                    >
                      {categoryCounts["all"] || 0}
                    </span>
                  </button>

                  {/* Individual Categories: PAYASAM, OIL, UNNIYAPPAM, CHIPS, PICKLES */}
                  {categories.map((cat) => {
                    const isSelected = selectedCategorySlug === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          handleCategoryChange(cat.slug);
                          setIsMobileFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#711e2c] bg-[#711e2c] text-white shadow-xs"
                            : "border-[#e5d8c6] bg-white text-[#2b1719]"
                        }`}
                      >
                        <span className="font-bold">{cat.name}</span>
                        <span
                          className={`text-[11px] rounded-full px-2 py-0.5 font-bold ${
                            isSelected ? "bg-white/25 text-white" : "bg-[#f4efeb] text-[#711e2c]"
                          }`}
                        >
                          {categoryCounts[cat.slug] || 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Price & Sort Tab */
                <div className="space-y-5">
                  {/* Price Range Filter */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#2b1719] mb-2.5 block">
                      Price Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRICE_RANGES.map((range) => {
                        const isSelected = selectedPriceRange === range.id;
                        return (
                          <button
                            key={range.id}
                            type="button"
                            onClick={() => handlePriceChange(range.id)}
                            className={`flex items-center justify-between rounded-xl border p-3 text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#711e2c] bg-[#711e2c] text-white shadow-xs"
                                : "border-[#e5d8c6] bg-white text-[#2b1719]"
                            }`}
                          >
                            <span>{range.label}</span>
                            {isSelected && <Check size={14} className="text-white shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#2b1719] mb-2.5 block">
                      Sort Order
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {SORT_OPTIONS.map((opt) => {
                        const isSelected = selectedSort === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSortChange(opt.id)}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#711e2c] bg-[#711e2c] text-white shadow-xs"
                                : "border-[#e5d8c6] bg-white text-[#2b1719]"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check size={14} className="text-white shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom,1rem))] border-t border-[#e5d8c6] bg-white flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-1/3 min-h-11 rounded-full border border-[#e5d8c6] text-xs font-semibold text-[#6e5b55] hover:bg-[#f4efeb] cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-2/3 min-h-11 rounded-full bg-[#711e2c] text-xs font-semibold text-white shadow-md hover:bg-[#5a1723] cursor-pointer"
              >
                View {filteredProducts.length} {filteredProducts.length === 1 ? "Item" : "Items"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
