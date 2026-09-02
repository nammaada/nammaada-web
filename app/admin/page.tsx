import Link from "next/link";
import { Package, CheckCircle2, Star, ShoppingCart, Clock, Truck, Check, Inbox, Plus, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function count(table: string, filters?: [string, string][]) {
  let query = (await createSupabaseServerClient()).from(table).select("id", { count: "exact", head: true });
  for (const [key, value] of filters ?? []) query = query.eq(key, value);
  const result = await query;
  return result.count ?? 0;
}

export default async function AdminPage() {
  const [
    products,
    activeProducts,
    featuredProducts,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    enquiries,
  ] = await Promise.all([
    count("admin_products"),
    count("admin_products", [["is_active", "true"]]),
    count("admin_products", [["is_featured", "true"]]),
    count("admin_orders", [["order_status", "pending"]]),
    count("admin_orders", [["order_status", "processing"]]),
    count("admin_orders", [["order_status", "shipped"]]),
    count("admin_orders", [["order_status", "delivered"]]),
    count("admin_bulk_enquiries", [["status", "new"]]),
  ]);

  const primaryMetrics = [
    { label: "Total products", value: products, icon: Package, href: "/admin/products" },
    { label: "Active products", value: activeProducts, icon: CheckCircle2, href: "/admin/products" },
    { label: "Featured products", value: featuredProducts, icon: Star, href: "/admin/products" },
    { label: "Pending orders", value: pendingOrders, icon: Clock, href: "/admin/orders", alert: pendingOrders > 0 },
  ];

  const secondaryMetrics = [
    { label: "Processing orders", value: processingOrders, icon: ShoppingCart, href: "/admin/orders" },
    { label: "Shipped orders", value: shippedOrders, icon: Truck, href: "/admin/orders" },
    { label: "Delivered orders", value: deliveredOrders, icon: Check, href: "/admin/orders" },
    { label: "New enquiries", value: enquiries, icon: Inbox, href: "/admin/enquiries", alert: enquiries > 0 },
  ];

  const quickActions = [
    { title: "Add product", description: "Create a new product listing", href: "/admin/products/new", icon: Plus },
    { title: "Manage products", description: "Update catalogue and pricing", href: "/admin/products", icon: Package },
    { title: "Manage shipping", description: "State shipping rates and zones", href: "/admin/shipping", icon: Truck },
    { title: "View orders", description: "Fulfill pending guest purchases", href: "/admin/orders", icon: ShoppingCart },
  ];

  return (
    <>
      <PageHeader
        description="Operational overview of Namma Ada product catalogue, fulfillment status, and customer enquiries."
        eyebrow="OVERVIEW"
        title="Admin dashboard"
      />

      {/* Primary Metrics Grid */}
      <div className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Catalogue & Active Orders
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {primaryMetrics.map(({ label, value, icon: Icon, href, alert }) => (
            <Link key={label} href={href} className="group">
              <Card className={`p-5 transition-all duration-200 group-hover:border-primary/40 group-hover:shadow-soft ${alert ? "border-amber-500/40 bg-amber-500/5" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                  <div className={`rounded-lg p-2 ${alert ? "bg-amber-500/15 text-amber-900" : "bg-secondary text-primary"}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-display text-3xl font-bold text-primary">{value}</span>
                  <ArrowUpRight className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Secondary Operational Metrics */}
      <div className="mb-10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Fulfillment & Enquiries
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {secondaryMetrics.map(({ label, value, icon: Icon, href, alert }) => (
            <Link key={label} href={href} className="group">
              <Card className={`p-5 transition-all duration-200 group-hover:border-primary/40 group-hover:shadow-soft ${alert ? "border-amber-500/40 bg-amber-500/5" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                  <div className="rounded-lg bg-secondary/80 p-2 text-foreground/75">
                    <Icon size={18} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="font-display text-2xl font-semibold text-foreground">{value}</span>
                  <ArrowUpRight className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ title, description, href, icon: Icon }) => (
            <Link key={title} href={href} className="group">
              <Card className="p-5 transition-all duration-200 group-hover:border-primary group-hover:bg-card/90">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary flex items-center gap-1">
                      {title}
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
