"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
import { saveCategory } from "@/actions/admin";
import { AdminField, CheckField, Submit } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
};

export function EditCategoryModal({ category }: { category: Category }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setIsOpen(true)} type="button">
        <Edit3 size={14} />
        <span>Edit</span>
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Edit "${category.name}"`}>
        <form action={saveCategory} className="grid gap-4 mt-2">
          <input name="id" type="hidden" value={category.id} />
          <AdminField defaultValue={category.name} label="Category name" name="name" required />
          <AdminField defaultValue={category.slug} helperText="Lowercase letters and hyphens" label="Slug" name="slug" required />
          <AdminField defaultValue={category.description || ""} label="Description" name="description" placeholder="Brief category description..." />
          <AdminField defaultValue={category.display_order} label="Display order" name="display_order" type="number" />
          <CheckField defaultChecked={category.is_active} label="Active" name="is_active" />

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
