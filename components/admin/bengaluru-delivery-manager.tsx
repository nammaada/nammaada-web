"use client";

import { useState, useTransition, useMemo } from "react";
import {
  MapPin,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  Edit3,
  X,
  Sparkles,
  Layers,
  Coins,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  upsertBengaluruPincodeAction,
  toggleBengaluruPincodeActiveAction,
  deleteBengaluruPincodeAction,
  bulkAddBengaluruPincodesAction,
} from "@/actions/admin";
import type { BangaloreShippingConfig } from "@/lib/shipping/rules";
import type {
  BengaluruPincodeConfig,
  BengaluruDeliverySummary,
} from "@/lib/delivery/bengaluru-pincodes-types";
import { getBengaluruDeliverySummary } from "@/lib/delivery/bengaluru-pincodes-types";

type Props = {
  bangaloreConfig: BangaloreShippingConfig;
  initialPincodes?: BengaluruPincodeConfig[];
  onOpenDefaultRateEdit: () => void;
  onSuccessMessage: (msg: string) => void;
};

export function BengaluruDeliveryManager({
  bangaloreConfig,
  initialPincodes = [],
  onOpenDefaultRateEdit,
  onSuccessMessage,
}: Props) {
  const [pincodes, setPincodes] = useState<BengaluruPincodeConfig[]>(initialPincodes);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "CUSTOM" | "DEFAULT">("ALL");
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [confirmDeactivatePin, setConfirmDeactivatePin] = useState<BengaluruPincodeConfig | null>(null);
  const [confirmDeletePin, setConfirmDeletePin] = useState<BengaluruPincodeConfig | null>(null);

  // Form states for Add/Edit
  const [editingItem, setEditingItem] = useState<BengaluruPincodeConfig | null>(null);
  const [formPincode, setFormPincode] = useState("");
  const [formLocality, setFormLocality] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formRateMode, setFormRateMode] = useState<"DEFAULT" | "CUSTOM">("DEFAULT");
  const [formChargeRupees, setFormChargeRupees] = useState("");
  const [formIsFree, setFormIsFree] = useState(false);
  const [formError, setFormError] = useState("");

  // Bulk Add form state
  const [bulkInput, setBulkInput] = useState("");
  const [bulkRateMode, setBulkRateMode] = useState<"DEFAULT" | "CUSTOM">("DEFAULT");
  const [bulkChargeRupees, setBulkChargeRupees] = useState("");
  const [bulkError, setBulkError] = useState("");

  const summary: BengaluruDeliverySummary = useMemo(() => {
    return getBengaluruDeliverySummary(pincodes);
  }, [pincodes]);

  const filteredPincodes = useMemo(() => {
    return pincodes.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        item.pincode.includes(q) || item.locality.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterType === "ACTIVE") return item.isActive;
      if (filterType === "INACTIVE") return !item.isActive;
      if (filterType === "CUSTOM") return item.isActive && item.chargePaise !== null;
      if (filterType === "DEFAULT") return item.isActive && item.chargePaise === null;

      return true;
    });
  }, [pincodes, search, filterType]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormPincode("");
    setFormLocality("");
    setFormIsActive(true);
    setFormRateMode("DEFAULT");
    setFormChargeRupees("");
    setFormIsFree(false);
    setFormError("");
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: BengaluruPincodeConfig) => {
    setEditingItem(item);
    setFormPincode(item.pincode);
    setFormLocality(item.locality);
    setFormIsActive(item.isActive);
    if (item.chargePaise !== null) {
      setFormRateMode("CUSTOM");
      const r = item.chargePaise / 100;
      setFormChargeRupees(String(r));
      setFormIsFree(r === 0);
    } else {
      setFormRateMode("DEFAULT");
      setFormChargeRupees("");
      setFormIsFree(false);
    }
    setFormError("");
    setIsEditModalOpen(true);
  };

  // Save Add/Edit
  const handleSavePincode = (isEdit: boolean) => {
    setFormError("");
    const pin = formPincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      setFormError("PIN code must be exactly 6 numeric digits (e.g. 560022).");
      return;
    }

    const locality = formLocality.trim();
    if (!locality) {
      setFormError("Please enter a locality name (e.g. Yeshwanthpur).");
      return;
    }

    if (!isEdit && pincodes.some((p) => p.pincode === pin)) {
      setFormError(`PIN code ${pin} is already configured in Bengaluru Special Delivery.`);
      return;
    }

    let chargeRupees: number | null = null;
    if (formRateMode === "CUSTOM") {
      if (formIsFree) {
        chargeRupees = 0;
      } else {
        const parsed = Number(formChargeRupees.trim());
        if (Number.isNaN(parsed) || parsed < 0) {
          setFormError("Please enter a valid, non-negative rate (₹0 or greater).");
          return;
        }
        if (parsed > 50000) {
          setFormError("Rate exceeds maximum allowed limit (₹50,000).");
          return;
        }
        chargeRupees = parsed;
      }
    }

    startTransition(async () => {
      const res = await upsertBengaluruPincodeAction({
        pincode: pin,
        locality,
        isActive: formIsActive,
        chargeRupees,
      });

      if (!res.ok) {
        setFormError(res.message || "Failed to save PIN code.");
        return;
      }

      setPincodes((prev) => {
        const chargePaise = chargeRupees !== null ? Math.round(chargeRupees * 100) : null;
        const existingIdx = prev.findIndex((p) => p.pincode === pin);
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            locality,
            isActive: formIsActive,
            chargePaise,
            updatedAt: new Date().toISOString(),
          };
          return next.sort((a, b) => a.pincode.localeCompare(b.pincode));
        } else {
          return [
            ...prev,
            {
              pincode: pin,
              locality,
              isActive: formIsActive,
              chargePaise,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ].sort((a, b) => a.pincode.localeCompare(b.pincode));
        }
      });

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      onSuccessMessage(
        isEdit
          ? `Successfully updated Bengaluru PIN ${pin} (${locality}).`
          : `Successfully added Bengaluru PIN ${pin} (${locality}).`
      );
    });
  };

  // Toggle active status
  const handleToggleActive = (item: BengaluruPincodeConfig) => {
    if (item.isActive) {
      // Require confirmation before deactivating!
      setConfirmDeactivatePin(item);
    } else {
      // Activating does not need confirmation
      executeToggleActive(item, true);
    }
  };

  const executeToggleActive = (item: BengaluruPincodeConfig, newActive: boolean) => {
    startTransition(async () => {
      const res = await toggleBengaluruPincodeActiveAction(item.pincode, newActive);
      if (res.ok) {
        setPincodes((prev) =>
          prev.map((p) => (p.pincode === item.pincode ? { ...p, isActive: newActive } : p))
        );
        onSuccessMessage(
          newActive
            ? `Activated delivery for PIN ${item.pincode} (${item.locality}).`
            : `Paused delivery for PIN ${item.pincode} (${item.locality}).`
        );
      }
      setConfirmDeactivatePin(null);
    });
  };

  // Delete PIN
  const executeDelete = (item: BengaluruPincodeConfig) => {
    startTransition(async () => {
      const res = await deleteBengaluruPincodeAction(item.pincode);
      if (res.ok) {
        setPincodes((prev) => prev.filter((p) => p.pincode !== item.pincode));
        onSuccessMessage(`Deleted PIN code ${item.pincode} from Bengaluru Special Delivery.`);
      }
      setConfirmDeletePin(null);
    });
  };

  // Bulk add execution
  const handleExecuteBulkAdd = () => {
    setBulkError("");
    if (!bulkInput.trim()) {
      setBulkError("Please paste or type at least one 6-digit PIN code.");
      return;
    }

    let defaultRate: number | null = null;
    if (bulkRateMode === "CUSTOM") {
      const parsed = Number(bulkChargeRupees.trim());
      if (Number.isNaN(parsed) || parsed < 0) {
        setBulkError("Please enter a valid default rate (₹0 or greater).");
        return;
      }
      defaultRate = parsed;
    }

    startTransition(async () => {
      const res = await bulkAddBengaluruPincodesAction(bulkInput, defaultRate);
      if (!res.ok) {
        setBulkError(res.message || "Failed to bulk add PIN codes.");
        return;
      }

      setIsBulkModalOpen(false);
      setBulkInput("");
      setBulkChargeRupees("");
      onSuccessMessage(
        `Bulk operation completed: added ${res.addedCount} new PINs, updated ${res.updatedCount} existing PINs.`
      );
      // Reload page state or update local
      window.location.reload();
    });
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/25 bg-gradient-to-br from-primary/5 via-card to-amber-500/5 shadow-xs">
      {/* SECTION HEADER */}
      <div className="border-b border-border/70 bg-secondary/30 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                <Sparkles size={12} />
                <span>Dedicated City Rule</span>
              </span>
              {bangaloreConfig.isConfigured && bangaloreConfig.isActive ? (
                <Badge variant="default" className="bg-emerald-600/15 text-emerald-800 border-emerald-500/30 text-xs font-semibold">
                  Mode A Default: {bangaloreConfig.chargePaise === 0 ? "Free (₹0/unit)" : `₹${bangaloreConfig.chargeRupees} / unit`}
                </Badge>
              ) : (
                <Badge variant="default" className="bg-amber-500/15 text-amber-900 border-amber-500/30 text-xs font-semibold">
                  Delivery Blocked (Inactive)
                </Badge>
              )}
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Bengaluru Special Delivery
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              Configurable delivery coverage and optional PIN-specific shipping charges for fresh delicacies (Chill’Ada, Payasam, Unniyappam). All active PINs inherit the city-wide default rate unless an explicit PIN-specific custom fee (or ₹0 free delivery) is configured.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onOpenDefaultRateEdit}
              className="gap-1.5 font-bold text-xs h-10 px-3.5 border-border bg-card hover:bg-secondary cursor-pointer"
            >
              <Coins size={14} className="text-primary" />
              <span>Configure Default Rate</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBulkInput("");
                setBulkError("");
                setIsBulkModalOpen(true);
              }}
              className="gap-1.5 font-bold text-xs h-10 px-3.5 border-border bg-card hover:bg-secondary cursor-pointer"
            >
              <Layers size={14} className="text-primary" />
              <span>Bulk Add PINs</span>
            </Button>
            <Button
              type="button"
              onClick={handleOpenAdd}
              className="gap-1.5 font-bold text-xs h-10 px-4 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add PIN Code</span>
            </Button>
          </div>
        </div>
      </div>

      {/* METRICS & OVERVIEW CARDS */}
      <div className="p-5 sm:p-6 border-b border-border/60 bg-card/60">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-border/80 bg-background/80 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Configured PINs
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-foreground">
                {summary.totalCount}
              </span>
              <span className="text-[11px] text-muted-foreground">total</span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Active Delivery
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-emerald-900">
                {summary.activeCount}
              </span>
              <span className="text-[11px] text-emerald-700">eligible</span>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
              Delivery Paused
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-amber-950">
                {summary.inactiveCount}
              </span>
              <span className="text-[11px] text-amber-800">blocked</span>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Custom Rates
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-foreground">
                {summary.customRateCount}
              </span>
              <span className="text-[11px] text-muted-foreground">PIN overrides</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by PIN or locality (e.g. 560022 or Yeshwanthpur)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs sm:text-sm h-10 bg-background"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "ALL", label: `All (${pincodes.length})` },
                { id: "ACTIVE", label: `Active (${summary.activeCount})` },
                { id: "INACTIVE", label: `Inactive (${summary.inactiveCount})` },
                { id: "CUSTOM", label: `Custom Rate (${summary.customRateCount})` },
                { id: "DEFAULT", label: `Default Rate (${summary.defaultRateCount})` },
              ] as const
            ).map((f) => (
              <Button
                key={f.id}
                type="button"
                variant={filterType === f.id ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilterType(f.id)}
                className={`text-xs h-8 px-2.5 font-medium cursor-pointer ${
                  filterType === f.id ? "" : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* PIN CODES TABLE */}
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">PIN Code</th>
                  <th className="py-3 px-4">Locality / Area Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Shipping Fee (Per Unit)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPincodes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-muted-foreground">
                      <MapPin className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="font-semibold text-sm">No PIN codes found matching your query.</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Try modifying search or filters, or add a new PIN code.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPincodes.map((item) => {
                    const isCustom = item.chargePaise !== null;
                    const effectiveRupees = isCustom
                      ? (item.chargePaise ?? 0) / 100
                      : bangaloreConfig.chargeRupees;

                    return (
                      <tr
                        key={item.pincode}
                        className={`hover:bg-muted/20 transition-colors ${
                          !item.isActive ? "bg-amber-500/5 opacity-75" : ""
                        }`}
                      >
                        {/* PIN Code */}
                        <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                          {item.pincode}
                        </td>

                        {/* Locality */}
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-foreground">{item.locality}</span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {item.isActive ? (
                            <Badge
                              variant="default"
                              className="bg-emerald-500/15 text-emerald-800 border-emerald-500/30 text-[11px] font-semibold"
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="default"
                              className="bg-amber-500/15 text-amber-900 border-amber-500/30 text-[11px] font-semibold"
                            >
                              Delivery Paused
                            </Badge>
                          )}
                        </td>

                        {/* Shipping Fee */}
                        <td className="py-3.5 px-4">
                          {isCustom ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-foreground font-mono">
                                {item.chargePaise === 0 ? "Free (₹0)" : `₹${effectiveRupees}`}
                              </span>
                              <Badge
                                variant="accent"
                                className="text-[10px] min-h-0 px-2 py-0.5 border border-primary/30 text-primary bg-primary/5"
                              >
                                Custom override
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-muted-foreground font-medium">
                                {bangaloreConfig.chargePaise === 0
                                  ? "Free (₹0)"
                                  : `₹${bangaloreConfig.chargeRupees}`}
                              </span>
                              <Badge
                                variant="default"
                                className="text-[10px] min-h-0 px-2 py-0.5 border border-border text-muted-foreground"
                              >
                                Default rate
                              </Badge>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(item)}
                              disabled={isPending}
                              title={item.isActive ? "Pause delivery for this PIN" : "Activate delivery for this PIN"}
                              className={`h-8 px-2 text-xs font-semibold cursor-pointer ${
                                item.isActive
                                  ? "text-amber-700 hover:bg-amber-500/10"
                                  : "text-emerald-700 hover:bg-emerald-500/10"
                              }`}
                            >
                              {item.isActive ? "Deactivate" : "Activate"}
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(item)}
                              className="h-8 px-2 text-xs text-foreground hover:bg-secondary cursor-pointer"
                            >
                              <Edit3 size={13} className="mr-1" />
                              <span>Edit</span>
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeletePin(item)}
                              disabled={isPending}
                              className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: ADD PIN CODE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="size-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">Add Bengaluru PIN Code</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  6-Digit Postal PIN Code <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 560038"
                  value={formPincode}
                  onChange={(e) => setFormPincode(e.target.value.replace(/[^0-9]/g, ""))}
                  className="font-mono text-base font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Locality / Area Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Indiranagar, Bengaluru"
                  value={formLocality}
                  onChange={(e) => setFormLocality(e.target.value)}
                />
              </div>

              <div className="space-y-2 rounded-xl border border-border/80 bg-secondary/30 p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                  Shipping Fee Configuration
                </label>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rateMode"
                      checked={formRateMode === "DEFAULT"}
                      onChange={() => setFormRateMode("DEFAULT")}
                      className="accent-primary"
                    />
                    <span className="font-medium text-xs">
                      Inherit Bengaluru Default (₹{bangaloreConfig.chargeRupees} / unit)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rateMode"
                      checked={formRateMode === "CUSTOM"}
                      onChange={() => setFormRateMode("CUSTOM")}
                      className="accent-primary"
                    />
                    <span className="font-medium text-xs">Custom Fee for this PIN (Mode B)</span>
                  </label>
                </div>

                {formRateMode === "CUSTOM" && (
                  <div className="pt-2 space-y-2 animate-in fade-in">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsFree}
                        onChange={(e) => {
                          setFormIsFree(e.target.checked);
                          if (e.target.checked) setFormChargeRupees("0");
                        }}
                        className="rounded accent-primary"
                      />
                      <span className="text-xs font-semibold text-emerald-800">
                        Free Delivery (₹0 / unit) for this PIN
                      </span>
                    </label>

                    {!formIsFree && (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                          ₹
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="40"
                          value={formChargeRupees}
                          onChange={(e) => setFormChargeRupees(e.target.value)}
                          className="pl-7 font-mono font-bold"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                          per product unit
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/80 bg-secondary/30 p-4">
                <div>
                  <span className="font-bold text-xs text-foreground block">Active Delivery Status</span>
                  <span className="text-[11px] text-muted-foreground">
                    Enable or pause deliveries to this specific PIN code
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="size-4 accent-primary cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleSavePincode(false)}
                disabled={isPending}
                className="cursor-pointer font-bold"
              >
                {isPending ? "Adding..." : "Add PIN Code"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PIN CODE */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="size-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  Edit Bengaluru PIN ({editingItem.pincode})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  PIN Code
                </label>
                <Input
                  type="text"
                  disabled
                  value={formPincode}
                  className="font-mono text-base font-bold bg-muted/50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Locality / Area Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Yeshwanthpur"
                  value={formLocality}
                  onChange={(e) => setFormLocality(e.target.value)}
                />
              </div>

              <div className="space-y-2 rounded-xl border border-border/80 bg-secondary/30 p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                  Shipping Fee Configuration
                </label>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editRateMode"
                      checked={formRateMode === "DEFAULT"}
                      onChange={() => setFormRateMode("DEFAULT")}
                      className="accent-primary"
                    />
                    <span className="font-medium text-xs">
                      Inherit Bengaluru Default (₹{bangaloreConfig.chargeRupees} / unit)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editRateMode"
                      checked={formRateMode === "CUSTOM"}
                      onChange={() => setFormRateMode("CUSTOM")}
                      className="accent-primary"
                    />
                    <span className="font-medium text-xs">Custom Fee for this PIN (Mode B)</span>
                  </label>
                </div>

                {formRateMode === "CUSTOM" && (
                  <div className="pt-2 space-y-2 animate-in fade-in">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsFree}
                        onChange={(e) => {
                          setFormIsFree(e.target.checked);
                          if (e.target.checked) setFormChargeRupees("0");
                        }}
                        className="rounded accent-primary"
                      />
                      <span className="text-xs font-semibold text-emerald-800">
                        Free Delivery (₹0 / unit) for this PIN
                      </span>
                    </label>

                    {!formIsFree && (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                          ₹
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="40"
                          value={formChargeRupees}
                          onChange={(e) => setFormChargeRupees(e.target.value)}
                          className="pl-7 font-mono font-bold"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                          per product unit
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/80 bg-secondary/30 p-4">
                <div>
                  <span className="font-bold text-xs text-foreground block">Active Delivery Status</span>
                  <span className="text-[11px] text-muted-foreground">
                    Enable or pause deliveries to this specific PIN code
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="size-4 accent-primary cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleSavePincode(true)}
                disabled={isPending}
                className="cursor-pointer font-bold"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BULK ADD PINS */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="size-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">Bulk Add Bengaluru PINs</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {bulkError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{bulkError}</span>
              </div>
            )}

            <div className="space-y-4 text-xs sm:text-sm">
              <p className="text-xs text-muted-foreground">
                Paste 6-digit PIN codes separated by comma or new lines. You can also optionally include locality and rate.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  PIN Codes Input
                </label>
                <textarea
                  rows={6}
                  placeholder={`560001, Central Bangalore\n560002, Shivaji Nagar, 40\n560034, Koramangala\n560038, Indiranagar`}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>

              <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                  Rate Override for Imported PINs
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkRateMode"
                      checked={bulkRateMode === "DEFAULT"}
                      onChange={() => setBulkRateMode("DEFAULT")}
                      className="accent-primary"
                    />
                    <span className="font-medium text-xs">
                      Inherit Bengaluru Default (₹{bangaloreConfig.chargeRupees} / unit)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bulkRateMode"
                      checked={bulkRateMode === "CUSTOM"}
                      onChange={() => setBulkRateMode("CUSTOM")}
                      className="accent-primary"
                    />
                    <span className="font-medium text-xs">Set Custom Rate for all imported PINs</span>
                  </label>
                </div>

                {bulkRateMode === "CUSTOM" && (
                  <div className="relative pt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                      ₹
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="40"
                      value={bulkChargeRupees}
                      onChange={(e) => setBulkChargeRupees(e.target.value)}
                      className="pl-7 font-mono font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                      per product unit
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBulkModalOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleExecuteBulkAdd}
                disabled={isPending}
                className="cursor-pointer font-bold"
              >
                {isPending ? "Importing..." : "Import PIN Codes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DEACTIVATE PIN */}
      {confirmDeactivatePin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="rounded-full bg-amber-500/10 p-2.5">
                <ShieldAlert className="size-6 text-amber-600" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                Pause Delivery for PIN {confirmDeactivatePin.pincode}?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to pause deliveries to{" "}
              <strong className="text-foreground">{confirmDeactivatePin.locality} ({confirmDeactivatePin.pincode})</strong>?
              Customers ordering Bangalore-only fresh delicacies will be blocked from checkout for this PIN code until re-activated.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDeactivatePin(null)}
                className="cursor-pointer"
              >
                Keep Active
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => executeToggleActive(confirmDeactivatePin, false)}
                disabled={isPending}
                className="cursor-pointer font-bold bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isPending ? "Pausing..." : "Yes, Pause Delivery"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE PIN */}
      {confirmDeletePin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="rounded-full bg-destructive/10 p-2.5">
                <Trash2 className="size-6 text-destructive" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                Delete PIN Code {confirmDeletePin.pincode}?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">{confirmDeletePin.locality} ({confirmDeletePin.pincode})</strong> from
              Bengaluru Special Delivery? Customers in this PIN area will no longer be eligible to receive Bangalore-only delicacies.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDeletePin(null)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => executeDelete(confirmDeletePin)}
                disabled={isPending}
                className="cursor-pointer font-bold"
              >
                {isPending ? "Deleting..." : "Delete PIN Code"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
