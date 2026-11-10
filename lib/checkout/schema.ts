import { z } from "zod";
import { pincodeSchema } from "@/lib/validation/schemas";
import { isValidState, isValidDistrictForState } from "@/lib/constants/india-geo";

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

const phone = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number.")
  .max(20, "Enter a valid phone number.")
  .refine(
    (value) => /^[+()0-9\s-]+$/.test(value) && (value.match(/[0-9]/g)?.length ?? 0) >= 7,
    "Enter a valid phone number."
  );

const optionalEmail = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .optional()
  .or(z.literal("").transform(() => undefined))
  .or(z.undefined());

export const checkoutSchema = z
  .object({
    fullName: requiredText("Full name", 120),
    phone,
    email: optionalEmail,
    address: requiredText("Address", 500),
    district: requiredText("District", 100),
    city: requiredText("City / Locality", 100),
    state: z
      .string()
      .trim()
      .min(1, "State is required.")
      .max(100, "State is too long.")
      .refine((val) => isValidState(val), "Please select a valid Indian State or Union Territory."),
    pincode: pincodeSchema,
  })
  .refine(
    (data) => {
      if (!data.state || !data.district) return true;
      return isValidDistrictForState(data.state, data.district);
    },
    {
      message: "Please select a valid district for the selected state.",
      path: ["district"],
    }
  );

export type CheckoutFormValues = z.input<typeof checkoutSchema>;
