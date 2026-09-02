"use client";

import { useState, type ReactNode } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  action: (formData: FormData) => Promise<void>;
  hiddenFields?: Record<string, string>;
  triggerBtn?: ReactNode;
  variant?: "destructive" | "primary";
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  action,
  hiddenFields = {},
  triggerBtn,
  variant = "destructive",
}: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      {triggerBtn ? (
        <div className="inline-block" onClick={handleOpen}>
          {triggerBtn}
        </div>
      ) : (
        <Button size="sm" variant={variant} onClick={handleOpen} type="button">
          <Trash2 size={14} />
          <span>{confirmLabel}</span>
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={handleClose} title={title}>
        <div className="flex gap-4 items-start mb-6">
          <div className="rounded-full bg-red-100 p-2.5 text-red-900 shrink-0 mt-0.5">
            <AlertTriangle size={20} />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>

        <form
          action={async (formData) => {
            setIsSubmitting(true);
            try {
              await action(formData);
              setIsOpen(false);
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="flex justify-end gap-3"
        >
          {Object.entries(hiddenFields).map(([key, val]) => (
            <input key={key} name={key} type="hidden" value={val} />
          ))}

          <Button disabled={isSubmitting} variant="secondary" onClick={handleClose} type="button">
            Cancel
          </Button>

          <Button isLoading={isSubmitting} variant={variant} type="submit">
            {confirmLabel}
          </Button>
        </form>
      </Modal>
    </>
  );
}
