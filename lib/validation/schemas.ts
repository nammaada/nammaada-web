import { z } from "zod";

/** Shared primitives for server-side validation. Domain schemas should compose these. */
export const uuidSchema = z.string().uuid();

export const quantitySchema = z.number().int().positive();

export const emailSchema = z.string().trim().email();

export const phoneSchema = z.string().trim().min(7).max(20);

export const pincodeSchema = z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid six-digit pincode.");
