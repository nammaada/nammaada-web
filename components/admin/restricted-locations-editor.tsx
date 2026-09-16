"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Edit2, Check, X, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { saveRestrictedLocationsAction } from "@/actions/store-settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { RestrictedLocation } from "@/lib/delivery/restricted-locations";

type Props = {
  initialLocations: RestrictedLocation[];
};

export function RestrictedLocationsEditor({ initialLocations }: Props) {
  const [locations, setLocations] = useState<RestrictedLocation[]>(initialLocations);
  const [newLocationName, setNewLocationName] = useState("");
  const [pincodeInputs, setPincodeInputs] = useState<Record<string, string>>({});
  const [editingPincode, setEditingPincode] = useState<{ locId: string; pinIndex: number; value: string } | null>(null);
  const [editingLocName, setEditingLocName] = useState<{ locId: string; value: string } | null>(null);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Add a new location
  function handleAddLocation() {
    const trimmed = newLocationName.trim();
    if (!trimmed) {
      setMessage({ type: "error", text: "Please enter a location name (e.g. Bangalore)." });
      return;
    }
    const newLoc: RestrictedLocation = {
      id: "loc_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      name: trimmed,
      pincodes: [],
    };
    setLocations((prev) => [...prev, newLoc]);
    setNewLocationName("");
    setMessage(null);
  }

  // Delete a location
  function handleDeleteLocation(locId: string) {
    setLocations((prev) => prev.filter((loc) => loc.id !== locId));
    setMessage(null);
  }

  // Save edited location name
  function handleSaveLocName(locId: string) {
    if (!editingLocName || !editingLocName.value.trim()) return;
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === locId ? { ...loc, name: editingLocName.value.trim() } : loc
      )
    );
    setEditingLocName(null);
    setMessage(null);
  }

  // Add pincode to location
  function handleAddPincode(locId: string) {
    const raw = (pincodeInputs[locId] ?? "").trim();
    if (!/^[1-9][0-9]{5}$/.test(raw)) {
      setMessage({ type: "error", text: "Please enter a valid 6-digit Indian pincode (e.g. 560001)." });
      return;
    }

    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.id !== locId) return loc;
        if (loc.pincodes.includes(raw)) {
          return loc;
        }
        return { ...loc, pincodes: [...loc.pincodes, raw] };
      })
    );

    setPincodeInputs((prev) => ({ ...prev, [locId]: "" }));
    setMessage(null);
  }

  // Delete individual pincode
  function handleDeletePincode(locId: string, pincodeToDelete: string) {
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === locId
          ? { ...loc, pincodes: loc.pincodes.filter((p) => p !== pincodeToDelete) }
          : loc
      )
    );
    setMessage(null);
  }

  // Save edited pincode
  function handleSavePincode() {
    if (!editingPincode) return;
    const trimmed = editingPincode.value.trim();
    if (!/^[1-9][0-9]{5}$/.test(trimmed)) {
      setMessage({ type: "error", text: "Please enter a valid 6-digit Indian pincode." });
      return;
    }

    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.id !== editingPincode.locId) return loc;
        const nextPins = [...loc.pincodes];
        nextPins[editingPincode.pinIndex] = trimmed;
        return { ...loc, pincodes: Array.from(new Set(nextPins)) };
      })
    );

    setEditingPincode(null);
    setMessage(null);
  }

  // Persist all changes to backend
  function handleSaveAll() {
    startTransition(async () => {
      setMessage(null);
      const res = await saveRestrictedLocationsAction(locations);
      if (res.ok) {
        setMessage({ type: "success", text: "Restricted delivery locations saved successfully." });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to save settings." });
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Alert banner */}
      {message && (
        <div
          role="alert"
          className={`flex items-center gap-3 rounded-xl p-4 text-sm font-medium ${
            message.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-900"
              : "border border-red-500/30 bg-red-500/10 text-red-900"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-700" />
          ) : (
            <AlertCircle className="size-5 shrink-0 text-red-700" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Container Card */}
      <Card className="p-6 sm:p-8 shadow-xs border-border/80">
        <div className="border-b border-border/80 pb-5 mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Restricted Delivery Locations
            </h2>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
            Configure locations and allowed pincodes for freshly prepared delicacies (e.g. Unniyappam, Payasam).
            Products set to Restricted Location will only be delivered to these pincodes via Cash on Delivery.
          </p>
        </div>

        {/* Add Location Form */}
        <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 sm:p-5 mb-8">
          <label htmlFor="new-loc-name" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Add New Location
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              id="new-loc-name"
              placeholder="e.g. Bangalore"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLocation();
                }
              }}
              className="flex-1 bg-card"
            />
            <Button
              type="button"
              onClick={handleAddLocation}
              size="md"
              className="shrink-0"
            >
              <Plus size={16} />
              <span>Add Location</span>
            </Button>
          </div>
        </div>

        {/* Locations List */}
        {locations.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-secondary/20 p-8 text-center">
            <MapPin className="mx-auto size-8 text-muted-foreground/60 mb-2" />
            <p className="font-semibold text-foreground">No locations configured.</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              No restricted delivery locations have been added yet. Add a location above to configure eligible delivery pincodes.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {locations.map((loc) => {
              const isEditingName = editingLocName?.locId === loc.id;

              return (
                <div
                  key={loc.id}
                  className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-5 transition-all"
                >
                  {/* Location Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <MapPin size={16} />
                      </span>
                      {isEditingName ? (
                        <div className="flex items-center gap-2 flex-1 max-w-sm">
                          <Input
                            autoFocus
                            value={editingLocName.value}
                            onChange={(e) =>
                              setEditingLocName({ locId: loc.id, value: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveLocName(loc.id);
                              }
                            }}
                            className="h-9 text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveLocName(loc.id)}
                            className="h-9 px-2.5"
                          >
                            <Check size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingLocName(null)}
                            className="h-9 px-2.5"
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-lg font-bold text-foreground">
                            {loc.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingLocName({ locId: loc.id, value: loc.name })
                            }
                            className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            aria-label={`Edit ${loc.name} name`}
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLocation(loc.id)}
                      className="text-red-700 hover:text-red-800 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 size={14} />
                      <span>Delete Location</span>
                    </Button>
                  </div>

                  {/* Add Pincode Row */}
                  <div>
                    <label
                      htmlFor={`pin-input-${loc.id}`}
                      className="block text-xs font-semibold text-muted-foreground mb-1.5"
                    >
                      Allowed Pincodes
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2.5 max-w-md">
                      <Input
                        id={`pin-input-${loc.id}`}
                        placeholder="Enter 6-digit pincode"
                        maxLength={6}
                        inputMode="numeric"
                        value={pincodeInputs[loc.id] ?? ""}
                        onChange={(e) =>
                          setPincodeInputs((prev) => ({ ...prev, [loc.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddPincode(loc.id);
                          }
                        }}
                        className="bg-card font-mono text-sm"
                      />
                      <Button
                        type="button"
                        onClick={() => handleAddPincode(loc.id)}
                        variant="secondary"
                        size="md"
                        className="shrink-0"
                      >
                        <Plus size={15} />
                        <span>Add</span>
                      </Button>
                    </div>
                  </div>

                  {/* Pincodes list / chips */}
                  <div>
                    {loc.pincodes.length === 0 ? (
                      <p className="text-xs italic text-muted-foreground/80 py-1">
                        No pincodes added yet for this location. Enter a 6-digit pincode above.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {loc.pincodes.map((pin, pIndex) => {
                          const isEditingThisPin =
                            editingPincode?.locId === loc.id &&
                            editingPincode?.pinIndex === pIndex;

                          if (isEditingThisPin) {
                            return (
                              <div
                                key={pIndex}
                                className="flex items-center gap-1 rounded-lg border border-primary/40 bg-card p-1 shadow-xs"
                              >
                                <Input
                                  autoFocus
                                  className="h-7 w-24 px-2 py-0 text-xs font-mono font-bold"
                                  maxLength={6}
                                  value={editingPincode.value}
                                  onChange={(e) =>
                                    setEditingPincode({
                                      ...editingPincode,
                                      value: e.target.value,
                                    })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleSavePincode();
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={handleSavePincode}
                                  className="rounded p-1 text-emerald-700 hover:bg-emerald-50"
                                  aria-label="Save pincode"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPincode(null)}
                                  className="rounded p-1 text-muted-foreground hover:bg-secondary"
                                  aria-label="Cancel editing"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <span
                              key={pin}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-xs font-mono font-semibold text-foreground shadow-2xs group"
                            >
                              <span>{pin}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingPincode({
                                    locId: loc.id,
                                    pinIndex: pIndex,
                                    value: pin,
                                  })
                                }
                                className="rounded p-0.5 text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100 transition-opacity"
                                aria-label={`Edit pincode ${pin}`}
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePincode(loc.id, pin)}
                                className="rounded p-0.5 text-red-600 hover:text-red-700 opacity-60 group-hover:opacity-100 transition-opacity"
                                aria-label={`Delete pincode ${pin}`}
                              >
                                <Trash2 size={12} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global Save Button */}
        <div className="mt-8 pt-6 border-t border-border flex justify-end">
          <Button
            type="button"
            onClick={handleSaveAll}
            disabled={isPending}
            size="lg"
            className="px-8 shadow-sm font-bold"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
