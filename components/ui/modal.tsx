"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
};

const maxWidths = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function Modal({ isOpen, onClose, title, description, children, maxWidth = "md" }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto h-[100dvh] w-screen overscroll-contain">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-primary/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        style={{ touchAction: "none" }}
      />

      {/* Modal Dialog Box */}
      <div
        aria-describedby={description ? "modal-description" : undefined}
        aria-labelledby="modal-title"
        aria-modal="true"
        className={`relative w-full ${maxWidths[maxWidth]} rounded-xl border border-border bg-card p-6 shadow-lifted z-10 transition-all animate-in zoom-in-95 duration-150`}
        role="dialog"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-xl text-foreground" id="modal-title">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground" id="modal-description">
                {description}
              </p>
            )}
          </div>
          <button
            aria-label="Close dialog"
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
