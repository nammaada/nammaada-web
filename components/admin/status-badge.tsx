import { Badge } from "@/components/ui/badge";

type StatusType = "active" | "inactive" | "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "new" | "in_progress" | "resolved" | "closed" | string;

export function StatusBadge({ status, className = "" }: { status: StatusType; className?: string }) {
  const normalized = String(status).toLowerCase();

  switch (normalized) {
    case "active":
    case "delivered":
    case "paid":
    case "resolved":
      return <Badge className={className} variant="success">{normalized.replace("_", " ")}</Badge>;

    case "pending":
    case "new":
    case "in_progress":
    case "processing":
      return <Badge className={className} variant="warning">{normalized.replace("_", " ")}</Badge>;

    case "shipped":
      return <Badge className={className} variant="accent">{normalized.replace("_", " ")}</Badge>;

    case "inactive":
    case "cancelled":
    case "refunded":
    case "closed":
      return <Badge className={className} variant="default">{normalized.replace("_", " ")}</Badge>;

    default:
      return <Badge className={className} variant="default">{status}</Badge>;
  }
}
