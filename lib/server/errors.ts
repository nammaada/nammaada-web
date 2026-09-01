export const serverErrorCodes = {
  validation: "validation",
  authentication: "authentication",
  authorization: "authorization",
  notFound: "not_found",
  conflict: "conflict",
  stockUnavailable: "stock_unavailable",
  deliveryUnavailable: "delivery_unavailable",
  paymentFailure: "payment_failure",
  externalService: "external_service",
  internal: "internal",
} as const;

export type ServerErrorCode = (typeof serverErrorCodes)[keyof typeof serverErrorCodes];

export class AppError extends Error {
  readonly code: ServerErrorCode;
  readonly publicMessage: string;

  constructor(code: ServerErrorCode, publicMessage: string, options?: ErrorOptions) {
    super(publicMessage, options);
    this.name = "AppError";
    this.code = code;
    this.publicMessage = publicMessage;
  }
}

export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.publicMessage;
  }

  return "Something went wrong. Please try again.";
}
