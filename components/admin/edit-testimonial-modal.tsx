"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
import { saveTestimonial } from "@/actions/admin";
import { AdminField, CheckField, Submit } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type TestimonialRow = {
  id: string;
  display_name: string;
  location: string | null;
  content: string;
  is_active: boolean;
  display_order: number;
};

export function EditTestimonialModal({ testimonial }: { testimonial: TestimonialRow }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setIsOpen(true)} type="button">
        <Edit3 size={14} />
        <span>Edit</span>
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Edit testimonial from "${testimonial.display_name}"`}>
        <form action={saveTestimonial} className="grid gap-4 mt-2">
          <input name="id" type="hidden" value={testimonial.id} />
          <AdminField defaultValue={testimonial.display_name} label="Display name" name="display_name" required />
          <AdminField defaultValue={testimonial.location || ""} label="Location" name="location" placeholder="e.g. Kochi, Kerala" />
          <label className="grid gap-1.5 text-sm font-semibold text-foreground">
            <span className="flex items-center gap-1">
              Content <span className="text-red-800 text-xs">*</span>
            </span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm font-normal text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
              defaultValue={testimonial.content}
              name="content"
              placeholder="Share the customer's authentic review..."
              required
            />
          </label>
          <AdminField defaultValue={testimonial.display_order} label="Display order" name="display_order" type="number" />
          <CheckField defaultChecked={testimonial.is_active} label="Active" name="is_active" />

          <div className="flex justify-end gap-3 pt-3 border-t border-border mt-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)} type="button">
              Cancel
            </Button>
            <Submit label="Save changes" />
          </div>
        </form>
      </Modal>
    </>
  );
}
