import { z } from "zod";
import { emailSchema, pincodeSchema } from "@/lib/validation/schemas";

const requiredText = (label: string, max: number) => z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

const phone = z.string()
  .trim()
  .min(7, "Enter a valid phone number.")
  .max(20, "Enter a valid phone number.")
  .refine((value) => /^[+()0-9\s-]+$/.test(value) && (value.match(/[0-9]/g)?.length ?? 0) >= 7, "Enter a valid phone number.");

const optionalEmail = z.union([emailSchema, z.literal("")]).transform((value) => value || undefined);

export const checkoutSchema = z.object({
  fullName: requiredText("Full name", 120),
  phone,
  email: optionalEmail,
  address: requiredText("Address", 500),
  city: requiredText("City", 100),
  state: requiredText("State", 100),
  pincode: pincodeSchema,
});

export type CheckoutFormValues = z.input<typeof checkoutSchema>;
