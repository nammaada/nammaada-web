"use client";

import { useState, useTransition, useMemo, useRef, useEffect } from "react";
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Edit3,
  X,
  Save,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  updateStateShippingRuleAction,
  bulkUpdateShippingRulesAction,
  updateBangaloreShippingConfigAction,
} from "@/actions/admin";
import type { StateShippingStatus, BangaloreShippingConfig } from "@/lib/shipping/rules";
import { BengaluruDeliveryManager } from "@/components/admin/bengaluru-delivery-manager";
import type { BengaluruPincodeConfig } from "@/lib/delivery/bengaluru-pincodes-types";

type ShippingManagerProps = {
  initialStates: StateShippingStatus[];
  initialBangaloreConfig?: BangaloreShippingConfig;
  initialBengaluruPincodes?: BengaluruPincodeConfig[];
};

export function ShippingManager({
  initialStates,
  initialBangaloreConfig,
  initialBengaluruPincodes,
}: ShippingManagerProps) {
  const [states, setStates] = useState<StateShippingStatus[]>(initialStates);
  const [bangaloreConfig, setBangaloreConfig] = useState<BangaloreShippingConfig>(
    initialBangaloreConfig ?? {
      chargePaise: 0,
      chargeRupees: 0,
      isActive: false,
      isConfigured: false,
    }
  );

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "STATES" | "UTS" | "ACTIVE" | "FREE" | "UNCONFIGURED">("ALL");
  const [successMessage, setSuccessMessage] = useState("");

  // Bangalore Special Edit Modal State
  const [isBangaloreModalOpen, setIsBangaloreModalOpen] = useState(false);
  const [bangaloreChargeRupees, setBangaloreChargeRupees] = useState<string>("");
  const [bangaloreIsActive, setBangaloreIsActive] = useState<boolean>(true);
  const [bangaloreIsFree, setBangaloreIsFree] = useState<boolean>(false);
  const [bangaloreError, setBangaloreError] = useState<string>("");
  const [isBangaloreConfirmOpen, setIsBangaloreConfirmOpen] = useState<boolean>(false);

  // Individual Edit Modal State
  const [editingState, setEditingState] = useState<StateShippingStatus | null>(null);
  const [editChargeRupees, setEditChargeRupees] = useState<string>("");
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editIsFreeShipping, setEditIsFreeShipping] = useState<boolean>(false);
  const [editError, setEditError] = useState<string>("");

  // Multi-Select & Bulk Edit State
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [bulkIsFreeShipping, setBulkIsFreeShipping] = useState<boolean>(false);
  const [bulkUpdateCharge, setBulkUpdateCharge] = useState<boolean>(true);
  const [bulkChargeRupees, setBulkChargeRupees] = useState<string>("");
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState<boolean>(false);
  const [bulkIsActive, setBulkIsActive] = useState<boolean>(true);
  const [bulkError, setBulkError] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [bulkConfirmError, setBulkConfirmError] = useState<string>("");

  const [isPending, startTransition] = useTransition();
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const totalStates = states.length;
  const activeCount = states.filter((s) => s.isConfigured && s.isActive).length;
  const freeCount = states.filter((s) => s.isConfigured && s.isActive && s.chargePaise === 0).length;
  const unconfiguredCount = states.filter((s) => !s.isConfigured || !s.isActive).length;

  const filteredStates = useMemo(() => {
    return states.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        s.code.toLowerCase().includes(search.toLowerCase().trim());

      if (!matchesSearch) return false;

      if (filterType === "STATES") return !s.isUnionTerritory;
      if (filterType === "UTS") return s.isUnionTerritory;
      if (filterType === "ACTIVE") return s.isConfigured && s.isActive;
      if (filterType === "FREE") return s.isConfigured && s.isActive && s.chargePaise === 0;
      if (filterType === "UNCONFIGURED") return !s.isConfigured || !s.isActive;

      return true;
    });
  }, [states, search, filterType]);

  // Sync indeterminate state of the header checkbox
  const isAllFilteredSelected =
    filteredStates.length > 0 && filteredStates.every((s) => selectedCodes.has(s.code));
  const isSomeFilteredSelected =
    filteredStates.some((s) => selectedCodes.has(s.code)) && !isAllFilteredSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isSomeFilteredSelected;
    }
  }, [isSomeFilteredSelected]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    setSuccessMessage("");
    if (isAllFilteredSelected) {
      setSelectedCodes((prev) => {
        const next = new Set(prev);
        for (const s of filteredStates) {
          next.delete(s.code);
        }
        return next;
      });
    } else {
      setSelectedCodes((prev) => {
        const next = new Set(prev);
        for (const s of filteredStates) {
          next.add(s.code);
        }
        return next;
      });
    }
  };

  const handleToggleRow = (code: string) => {
    setSuccessMessage("");
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedCodes(new Set());
    setBulkError("");
    setBulkConfirmError("");
    setBulkIsFreeShipping(false);
  };

  // Selected territories objects list (for confirmation modal summary)
  const selectedStatesList = useMemo(() => {
    return states.filter((s) => selectedCodes.has(s.code));
  }, [states, selectedCodes]);

  const karnatakaState = useMemo(() => states.find((s) => s.code === "KA"), [states]);

  // Bangalore Special Edit Handlers
  const handleOpenBangaloreEdit = () => {
    setBangaloreChargeRupees(
      bangaloreConfig.isConfigured ? String(bangaloreConfig.chargeRupees) : ""
    );
    setBangaloreIsActive(
      bangaloreConfig.isConfigured ? bangaloreConfig.isActive : true
    );
    setBangaloreIsFree(
      bangaloreConfig.isConfigured &&
        bangaloreConfig.isActive &&
        bangaloreConfig.chargePaise === 0
    );
    setBangaloreError("");
    setIsBangaloreModalOpen(true);
  };

  const handleCloseBangaloreEdit = () => {
    setIsBangaloreModalOpen(false);
    setIsBangaloreConfirmOpen(false);
    setBangaloreError("");
  };

  const handleToggleBangaloreFree = (checked: boolean) => {
    setBangaloreIsFree(checked);
    if (checked) {
      setBangaloreChargeRupees("0");
      setBangaloreIsActive(true);
    } else {
      if (bangaloreChargeRupees === "0") setBangaloreChargeRupees("");
    }
  };

  const handlePromptBangaloreConfirm = () => {
    setBangaloreError("");
    const val = bangaloreIsFree ? 0 : Number.parseFloat(bangaloreChargeRupees);
    if (Number.isNaN(val) || val < 0) {
      setBangaloreError("Please enter a valid delivery charge (₹0 or greater).");
      return;
    }
    if (val > 50000) {
      setBangaloreError("Delivery charge exceeds maximum allowed threshold (₹50,000).");
      return;
    }
    setIsBangaloreConfirmOpen(true);
  };

  const handleSaveBangaloreRate = () => {
    const val = bangaloreIsFree ? 0 : Number.parseFloat(bangaloreChargeRupees);
    startTransition(async () => {
      const res = await updateBangaloreShippingConfigAction({
        chargeRupees: val,
        isActive: bangaloreIsActive,
      });

      if (!res.ok) {
        setBangaloreError(res.message || "Failed to update Bangalore shipping rate.");
        setIsBangaloreConfirmOpen(false);
        return;
      }

      setBangaloreConfig({
        chargeRupees: val,
        chargePaise: Math.round(val * 100),
        isActive: bangaloreIsActive,
        isConfigured: true,
      });

      setIsBangaloreConfirmOpen(false);
      setIsBangaloreModalOpen(false);
      setSuccessMessage(
        val === 0 && bangaloreIsActive
          ? "Free delivery enabled for Bangalore Special Shipping."
          : `Updated Bangalore Special Shipping rate to ₹${val} per product unit.`
      );
    });
  };

  // Individual Edit Handlers
  const handleOpenEdit = (state: StateShippingStatus) => {
    setEditingState(state);
    const isFree = state.isConfigured && state.isActive && state.chargePaise === 0;
    setEditIsFreeShipping(isFree);
    setEditChargeRupees(state.isConfigured ? String(state.chargeRupees) : "");
    setEditIsActive(state.isConfigured ? state.isActive : true);
    setEditError("");
  };

  const handleCloseEdit = () => {
    setEditingState(null);
    setEditError("");
    setEditIsFreeShipping(false);
  };

  const handleToggleEditFreeShipping = (checked: boolean) => {
    setEditIsFreeShipping(checked);
    if (checked) {
      // Enabling Free Shipping sets charge_paise = 0 and is_active = true
      setEditChargeRupees("0");
      setEditIsActive(true);
    } else {
      // Disabling Free Shipping should not silently activate an inactive state
      if (editChargeRupees === "0") {
        setEditChargeRupees("");
      }
    }
  };

  const handleSaveRate = () => {
    if (!editingState) return;

    const val = editIsFreeShipping ? 0 : Number.parseFloat(editChargeRupees);
    if (Number.isNaN(val) || val < 0) {
      setEditError("Please enter a valid delivery charge (0 or greater).");
      return;
    }

    startTransition(async () => {
      const res = await updateStateShippingRuleAction({
        stateCode: editingState.code,
        stateName: editingState.name,
        chargeRupees: val,
        isActive: editIsActive,
      });

      if (!res.ok) {
        setEditError(res.message || "Could not save shipping rule.");
        return;
      }

      setStates((prev) =>
        prev.map((s) =>
          s.code === editingState.code
            ? {
                ...s,
                chargeRupees: val,
                chargePaise: Math.round(val * 100),
                isActive: editIsActive,
                isConfigured: true,
                isFreeShipping: editIsActive && val === 0,
              }
            : s
        )
      );

      handleCloseEdit();
      setSuccessMessage(
        val === 0 && editIsActive
          ? `Free delivery enabled for ${editingState.name}.`
          : `Updated shipping rate for ${editingState.name}.`
      );
    });
  };

  const handleToggleBulkFreeShipping = (checked: boolean) => {
    setBulkIsFreeShipping(checked);
    if (checked) {
      // Enabling Free Shipping sets charge_paise = 0 and is_active = true
      setBulkUpdateCharge(true);
      setBulkChargeRupees("0");
      setBulkUpdateStatus(true);
      setBulkIsActive(true);
    } else {
      // Disabling Free Shipping should not silently activate an inactive state
      setBulkChargeRupees("");
      setBulkUpdateCharge(false);
      setBulkUpdateStatus(false);
    }
  };

  // Bulk Edit Handlers
  const handleOpenBulkConfirm = () => {
    setBulkError("");
    setBulkConfirmError("");

    if (selectedCodes.size === 0) {
      setBulkError("Please select at least one territory from the table.");
      return;
    }

    if (!bulkUpdateCharge && !bulkUpdateStatus) {
      setBulkError("Please choose at least one field to update (Delivery Fee or Delivery Status).");
      return;
    }

    if (bulkUpdateCharge) {
      const val = Number.parseFloat(bulkChargeRupees);
      if (Number.isNaN(val) || val < 0) {
        setBulkError("Please enter a valid delivery charge (₹0 or greater).");
        return;
      }
      if (val > 50000) {
        setBulkError("Delivery charge exceeds maximum allowed threshold (₹50,000).");
        return;
      }
    }

    setIsConfirmOpen(true);
  };

  const handleExecuteBulkUpdate = () => {
    setBulkConfirmError("");
    const codesArray = Array.from(selectedCodes);
    const chargeVal = bulkUpdateCharge ? Number.parseFloat(bulkChargeRupees) : undefined;

    startTransition(async () => {
      const res = await bulkUpdateShippingRulesAction({
        stateCodes: codesArray,
        updateCharge: bulkUpdateCharge,
        chargeRupees: chargeVal,
        updateStatus: bulkUpdateStatus,
        isActive: bulkIsActive,
      });

      if (!res.ok) {
        setBulkConfirmError(res.message || "Bulk update failed. Please try again.");
        return;
      }

      // Optimistically update local component states
      setStates((prev) =>
        prev.map((s) => {
          if (!selectedCodes.has(s.code)) return s;
          const newChargeRupees = bulkUpdateCharge && chargeVal !== undefined ? chargeVal : s.chargeRupees;
          const newActive = bulkUpdateStatus ? bulkIsActive : s.isActive;
          return {
            ...s,
            chargeRupees: newChargeRupees,
            chargePaise:
              bulkUpdateCharge && chargeVal !== undefined
                ? Math.round(chargeVal * 100)
                : s.chargePaise,
            isActive: newActive,
            isConfigured: bulkUpdateCharge || s.isConfigured,
            isFreeShipping: newActive && newChargeRupees === 0,
          };
        })
      );

      const count = res.updatedCount;
      setIsConfirmOpen(false);
      setSelectedCodes(new Set());
      setBulkIsFreeShipping(false);
      setSuccessMessage(
        `Successfully updated ${count} ${count === 1 ? "territory" : "territories"} in bulk.`
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Territories
            </span>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Truck size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display text-3xl font-bold text-foreground">{totalStates}</span>
            <p className="text-xs text-muted-foreground mt-0.5">28 States & 8 Union Territories</p>
          </div>
        </Card>

        <Card className="p-5 border-emerald-500/30 bg-emerald-500/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Active Delivery
            </span>
            <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-800">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display text-3xl font-bold text-emerald-900">{activeCount}</span>
            <p className="text-xs text-emerald-700 mt-0.5">Configured with live delivery rates</p>
          </div>
        </Card>

        <Card className="p-5 border-amber-500/30 bg-amber-500/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-900">
              Delivery Blocked / Unconfigured
            </span>
            <div className="rounded-lg bg-amber-500/15 p-2 text-amber-900">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display text-3xl font-bold text-amber-950">{unconfiguredCount}</span>
            <p className="text-xs text-amber-800 mt-0.5">Delivery unavailable until configured</p>
          </div>
        </Card>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs sm:text-sm text-emerald-900 font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* BENGALURU SPECIAL DELIVERY PIN CODE & RATE MANAGEMENT */}
      <BengaluruDeliveryManager
        bangaloreConfig={bangaloreConfig}
        initialPincodes={initialBengaluruPincodes}
        onOpenDefaultRateEdit={handleOpenBangaloreEdit}
        onSuccessMessage={(msg) => setSuccessMessage(msg)}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search state name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm bg-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={filterType === "ALL" ? "primary" : "outline"}
            onClick={() => setFilterType("ALL")}
            className="text-xs h-9 cursor-pointer"
          >
            All (36)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterType === "STATES" ? "primary" : "outline"}
            onClick={() => setFilterType("STATES")}
            className="text-xs h-9 cursor-pointer"
          >
            States (28)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterType === "UTS" ? "primary" : "outline"}
            onClick={() => setFilterType("UTS")}
            className="text-xs h-9 cursor-pointer"
          >
            UTs (8)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterType === "ACTIVE" ? "primary" : "outline"}
            onClick={() => setFilterType("ACTIVE")}
            className="text-xs h-9 cursor-pointer text-emerald-700"
          >
            Active ({activeCount})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterType === "FREE" ? "primary" : "outline"}
            onClick={() => setFilterType("FREE")}
            className="text-xs h-9 cursor-pointer text-emerald-800"
          >
            Free Delivery ({freeCount})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterType === "UNCONFIGURED" ? "primary" : "outline"}
            onClick={() => setFilterType("UNCONFIGURED")}
            className="text-xs h-9 cursor-pointer text-amber-800"
          >
            Unconfigured ({unconfiguredCount})
          </Button>
        </div>
      </div>

      {/* Bulk Action Toolbar (Appears when >= 1 territory is selected) */}
      {selectedCodes.size > 0 && (
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 sm:p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/20 pb-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-bold px-2.5 py-1 text-xs">
                {selectedCodes.size} {selectedCodes.size === 1 ? "territory" : "territories"} selected
              </Badge>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Choose the fields to update across all selected regions
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground underline cursor-pointer"
            >
              Clear selection
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
            {/* Field 0: Free Shipping Preset */}
            <div className="space-y-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 shadow-2xs">
              <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bulkIsFreeShipping}
                  onChange={(e) => handleToggleBulkFreeShipping(e.target.checked)}
                  className="size-4 rounded border-border accent-emerald-700 cursor-pointer"
                  disabled={isPending}
                />
                <span>Set Free Shipping</span>
              </label>
              <p className="text-[10px] text-emerald-800">
                Sets fee to ₹0 and enables delivery for all {selectedCodes.size} selected.
              </p>
            </div>

            {/* Field 1: Delivery Fee */}
            <div className="space-y-2 rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bulkUpdateCharge}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setBulkUpdateCharge(checked);
                    if (!checked && bulkIsFreeShipping) {
                      setBulkIsFreeShipping(false);
                    }
                  }}
                  className="size-4 rounded border-border accent-primary cursor-pointer"
                />
                <span>Update Delivery Fee</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                  ₹
                </span>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 60"
                  value={bulkChargeRupees}
                  disabled={!bulkUpdateCharge || isPending || bulkIsFreeShipping}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBulkChargeRupees(val);
                    if (val !== "0" && val !== "") {
                      setBulkIsFreeShipping(false);
                    }
                  }}
                  className="pl-8 font-mono text-sm font-semibold h-9 disabled:opacity-40"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {bulkIsFreeShipping
                  ? "Free Shipping preset is active (₹0 fee)."
                  : "Set to 0 for free delivery across selected territories."}
              </p>
            </div>

            {/* Field 2: Delivery Status */}
            <div className="space-y-2 rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bulkUpdateStatus}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setBulkUpdateStatus(checked);
                    if (!checked && bulkIsFreeShipping) {
                      setBulkIsFreeShipping(false);
                    }
                  }}
                  className="size-4 rounded border-border accent-primary cursor-pointer"
                />
                <span>Update Delivery Status</span>
              </label>
              <select
                value={bulkIsActive ? "ACTIVE" : "INACTIVE"}
                disabled={!bulkUpdateStatus || isPending || bulkIsFreeShipping}
                onChange={(e) => {
                  const active = e.target.value === "ACTIVE";
                  setBulkIsActive(active);
                  if (!active) {
                    setBulkIsFreeShipping(false);
                  }
                }}
                className="w-full h-9 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground outline-none transition-colors focus:border-primary disabled:opacity-40 cursor-pointer"
              >
                <option value="ACTIVE">Active (Delivery Allowed)</option>
                <option value="INACTIVE">Unavailable (Delivery Blocked)</option>
              </select>
              <p className="text-[10px] text-muted-foreground">
                Controls whether checkout is permitted for selected territories.
              </p>
            </div>

            {/* Apply and Cancel Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleOpenBulkConfirm}
                disabled={isPending || (!bulkUpdateCharge && !bulkUpdateStatus)}
                className="flex-1 h-10 gap-2 cursor-pointer font-bold text-xs"
              >
                <SlidersHorizontal size={14} />
                <span>Apply to {selectedCodes.size} Selected</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearSelection}
                disabled={isPending}
                className="h-10 text-xs cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>

          {bulkError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 font-medium">
              {bulkError}
            </div>
          )}
        </div>
      )}

      {/* Rates Table */}
      <Card className="overflow-hidden shadow-xs border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/60 text-xs font-bold tracking-wider uppercase text-muted-foreground">
              <tr>
                <th className="w-12 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    ref={headerCheckboxRef}
                    checked={isAllFilteredSelected && filteredStates.length > 0}
                    onChange={handleToggleSelectAll}
                    aria-label="Select all displayed territories"
                    className="size-4 rounded border-border accent-primary cursor-pointer align-middle"
                  />
                </th>
                <th className="px-4 py-3.5">State / Union Territory</th>
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Flat Delivery Fee</th>
                <th className="px-4 py-3.5">Delivery Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStates.map((state) => {
                const isActive = state.isConfigured && state.isActive;
                const isSelected = selectedCodes.has(state.code);
                return (
                  <tr
                    key={state.code}
                    className={`transition-colors ${
                      isSelected ? "bg-primary/5 font-medium" : "hover:bg-secondary/30"
                    }`}
                  >
                    <td className="w-12 px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRow(state.code)}
                        aria-label={`Select ${state.name}`}
                        className="size-4 rounded border-border accent-primary cursor-pointer align-middle"
                      />
                    </td>
                    <td className="px-4 py-4 font-semibold text-foreground">
                      {state.name}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs font-bold text-muted-foreground">
                      {state.code}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {state.isUnionTerritory ? "Union Territory" : "State"}
                    </td>
                    <td className="px-4 py-4">
                      {state.isConfigured ? (
                        isActive && state.chargePaise === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold bg-emerald-600/15 text-emerald-800 border border-emerald-500/30">
                            Free Delivery (₹0)
                          </span>
                        ) : (
                          <span className="font-semibold text-primary font-mono text-sm">
                            ₹{state.chargeRupees}
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground italic font-sans">
                          Not set
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {isActive ? (
                        state.chargePaise === 0 ? (
                          <Badge variant="default" className="bg-emerald-600/15 text-emerald-800 border-emerald-500/30 text-xs font-semibold">
                            Active (Free Shipping)
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-emerald-600/15 text-emerald-800 border-emerald-500/30 text-xs font-semibold">
                            Active (Delivery Allowed)
                          </Badge>
                        )
                      ) : (
                        <Badge variant="default" className="bg-amber-500/15 text-amber-900 border-amber-500/30 text-xs font-semibold">
                          Unavailable (Blocked)
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEdit(state)}
                        className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>{state.isConfigured ? "Edit Rate" : "Set Rate"}</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredStates.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No regions matching your search or filter.
            </div>
          )}
        </div>
      </Card>

      {/* Individual Edit Rate Modal */}
      {editingState && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  Configure Shipping Charge
                </span>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {editingState.name} ({editingState.code})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Explicit Free Shipping Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-3.5">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">Free Shipping</span>
                  <span className="text-[11px] text-emerald-700">
                    Deliver for free to {editingState.name} (sets fee to ₹0 and enables delivery).
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="isFreeShippingToggle"
                  checked={editIsFreeShipping}
                  onChange={(e) => handleToggleEditFreeShipping(e.target.checked)}
                  className="size-5 rounded border-border accent-emerald-700 cursor-pointer"
                  disabled={isPending}
                />
              </div>

              <div>
                <label
                  htmlFor="chargeRupees"
                  className="block text-xs font-semibold text-foreground mb-1.5"
                >
                  Flat Delivery Charge for Entire Order (in ₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="chargeRupees"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 50"
                    value={editChargeRupees}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditChargeRupees(val);
                      if (val !== "0" && val !== "") {
                        setEditIsFreeShipping(false);
                      } else if (val === "0" && editIsActive) {
                        setEditIsFreeShipping(true);
                      }
                    }}
                    className="pl-8 font-mono text-base font-semibold"
                    disabled={isPending || editIsFreeShipping}
                    autoFocus={!editIsFreeShipping}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {editIsFreeShipping
                    ? "Free Shipping enabled (₹0 delivery charge)."
                    : `Charged once per order when shipping to ${editingState.name}. Set to 0 for free delivery.`}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3.5">
                <div>
                  <span className="text-xs font-bold text-foreground block">Enable Delivery</span>
                  <span className="text-[11px] text-muted-foreground">
                    When active, customers in {editingState.name} can select this state and complete checkout.
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={editIsActive}
                  onChange={(e) => {
                    const active = e.target.checked;
                    setEditIsActive(active);
                    if (!active) {
                      setEditIsFreeShipping(false);
                    } else if (editChargeRupees === "0") {
                      setEditIsFreeShipping(true);
                    }
                  }}
                  className="size-5 rounded border-border accent-primary cursor-pointer"
                  disabled={isPending}
                />
              </div>

              {editError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 font-medium">
                  {editError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCloseEdit}
                disabled={isPending}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveRate}
                disabled={isPending}
                className="gap-2 cursor-pointer min-w-28"
              >
                {isPending ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{isPending ? "Saving..." : "Save Rate"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Confirmation Modal */}
      {isConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  Bulk Rate Update Confirmation
                </span>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Update {selectedCodes.size} {selectedCodes.size === 1 ? "Territory" : "Territories"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isPending}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Selected Territories List */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Selected States & Union Territories ({selectedCodes.size}):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 rounded-xl border border-border bg-secondary/30">
                  {selectedStatesList.map((st) => (
                    <Badge key={st.code} variant="default" className="text-xs font-medium py-1 px-2 bg-card border border-border">
                      {st.name} <span className="font-mono text-[10px] text-muted-foreground ml-1">({st.code})</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Free Shipping Mode Highlight Banner */}
              {(bulkIsFreeShipping || (bulkUpdateCharge && Number(bulkChargeRupees) === 0 && bulkUpdateStatus && bulkIsActive)) && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/70 p-3 text-xs text-emerald-900 font-semibold flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Free Shipping Mode:</span>
                    All {selectedCodes.size} selected {selectedCodes.size === 1 ? "territory" : "territories"} will have their shipping fee set to ₹0 and delivery will be activated for customer checkout.
                  </div>
                </div>
              )}

              {/* Changes Summary */}
              <div className="space-y-2 rounded-xl border border-border bg-secondary/20 p-4 text-xs">
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px] block">
                  Planned Changes:
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Delivery Fee:</span>
                    {bulkUpdateCharge ? (
                      <span className="font-mono font-bold text-primary text-sm">
                        ₹{bulkChargeRupees} {Number(bulkChargeRupees) === 0 ? "(Free Delivery)" : ""}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">Unchanged</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Delivery Status:</span>
                    {bulkUpdateStatus ? (
                      bulkIsActive ? (
                        <Badge className="bg-emerald-600/15 text-emerald-800 border-emerald-500/30 text-[11px] font-semibold">
                          Active (Delivery Allowed)
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/15 text-amber-900 border-amber-500/30 text-[11px] font-semibold">
                          Unavailable (Blocked)
                        </Badge>
                      )
                    ) : (
                      <span className="text-muted-foreground italic">Unchanged</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-[11px] text-blue-900 leading-relaxed">
                <strong>Instant Effect:</strong> After confirmation, these delivery fees and status changes will immediately update the live database and storefront shipping quotes across Add to Cart, Cart, and Checkout.
              </div>

              {bulkConfirmError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 font-medium">
                  {bulkConfirmError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isPending}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleExecuteBulkUpdate}
                disabled={isPending}
                className="gap-2 cursor-pointer min-w-32 font-bold"
              >
                {isPending ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{isPending ? "Applying..." : "Confirm & Apply"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bangalore Special Shipping Edit Modal */}
      {isBangaloreModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  Special Delivery Configuration
                </span>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Bangalore Special Shipping
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseBangaloreEdit}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Free Shipping Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-3.5">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">Free Bangalore Delivery</span>
                  <span className="text-[11px] text-emerald-700">
                    Deliver Bangalore delicacies for free (sets per-unit charge to ₹0 and enables delivery).
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="bangaloreFreeShippingToggle"
                  checked={bangaloreIsFree}
                  onChange={(e) => handleToggleBangaloreFree(e.target.checked)}
                  className="size-5 rounded border-border accent-emerald-700 cursor-pointer"
                  disabled={isPending}
                />
              </div>

              {/* Charge per unit input */}
              <div>
                <label
                  htmlFor="bangaloreChargeRupees"
                  className="block text-xs font-semibold text-foreground mb-1.5"
                >
                  Delivery Charge per Product Unit (in ₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="bangaloreChargeRupees"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 40"
                    value={bangaloreChargeRupees}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBangaloreChargeRupees(val);
                      if (val !== "0" && val !== "") {
                        setBangaloreIsFree(false);
                      } else if (val === "0" && bangaloreIsActive) {
                        setBangaloreIsFree(true);
                      }
                    }}
                    className="pl-8 font-mono text-base font-semibold"
                    disabled={isPending || bangaloreIsFree}
                    autoFocus={!bangaloreIsFree}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {bangaloreIsFree
                    ? "Free Bangalore delivery enabled (₹0 per unit)."
                    : "Charged per product unit on every item in cart when restricted delicacies are present."}
                </p>
              </div>

              {/* Enable Bangalore Delivery Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3.5">
                <div>
                  <span className="text-xs font-bold text-foreground block">Enable Bangalore Delivery</span>
                  <span className="text-[11px] text-muted-foreground">
                    When active, customers in valid Bangalore pincodes can checkout with restricted delicacies.
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="bangaloreIsActiveToggle"
                  checked={bangaloreIsActive}
                  onChange={(e) => {
                    const active = e.target.checked;
                    setBangaloreIsActive(active);
                    if (!active) {
                      setBangaloreIsFree(false);
                    } else if (bangaloreChargeRupees === "0") {
                      setBangaloreIsFree(true);
                    }
                  }}
                  className="size-5 rounded border-border accent-primary cursor-pointer"
                  disabled={isPending}
                />
              </div>

              {/* Explanatory note */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-[11px] text-blue-900 leading-relaxed">
                <strong>Independent Rule:</strong> Updating Bangalore special delivery does not alter or overwrite Karnataka&apos;s standard state shipping rate.
              </div>

              {bangaloreError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 font-medium">
                  {bangaloreError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCloseBangaloreEdit}
                disabled={isPending}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handlePromptBangaloreConfirm}
                disabled={isPending}
                className="gap-2 cursor-pointer min-w-28 font-bold"
              >
                <span>Review & Save</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bangalore Confirmation Modal */}
      {isBangaloreConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  Confirmation Required
                </span>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Update Bangalore Special Rate
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBangaloreConfirmOpen(false)}
                disabled={isPending}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-2">
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px] block">
                  Planned Changes:
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Charge per unit:</span>
                  <span className="font-mono font-bold text-primary text-sm">
                    {bangaloreIsFree || Number(bangaloreChargeRupees) === 0 ? "Free (₹0 / unit)" : `₹${bangaloreChargeRupees} per unit`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delivery Status:</span>
                  {bangaloreIsActive ? (
                    <Badge className="bg-emerald-600/15 text-emerald-800 border-emerald-500/30 text-[11px] font-semibold">
                      Active (Delivery Allowed)
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/15 text-amber-900 border-amber-500/30 text-[11px] font-semibold">
                      Unavailable (Delivery Blocked)
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-muted-foreground">Karnataka Standard Rate:</span>
                  <span className="font-mono font-semibold text-muted-foreground">
                    ₹{karnatakaState?.chargeRupees ?? 0} flat (Unchanged)
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-900 leading-relaxed">
                <strong>Instant Effect:</strong> This update will immediately reflect on the product page, cart drawer, cart page, and checkout calculation for all orders containing fresh Bangalore delicacies.
              </div>

              {bangaloreError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 font-medium">
                  {bangaloreError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsBangaloreConfirmOpen(false)}
                disabled={isPending}
                className="cursor-pointer"
              >
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveBangaloreRate}
                disabled={isPending}
                className="gap-2 cursor-pointer min-w-32 font-bold"
              >
                {isPending ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{isPending ? "Saving..." : "Confirm & Save"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
