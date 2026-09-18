import { APIProduct, OrderAPIResponse } from "@/types/order";

export function orderHasAction(
  actions: string[] | undefined,
  ...keys: string[]
): boolean {
  if (!actions?.length) return false;
  const normalized = new Set(actions.map((a) => a.toLowerCase()));
  return keys.some((key) => normalized.has(key.toLowerCase()));
}

const ORDER_PRODUCT_IMAGE_FALLBACK = "/images/image-coming-soon.jpg";

export function getReviewProductId(
  product: Pick<APIProduct, "product_id" | "id">
): string {
  const id = product.product_id || product.id;
  return id ? String(id) : "";
}

export function getOrderProductImage(product: Pick<APIProduct, "image">): string {
  const url = product.image?.trim();
  return url || ORDER_PRODUCT_IMAGE_FALLBACK;
}

export function canReviewProduct(
  product: Pick<APIProduct, "available_actions" | "available_options">
): boolean {
  const actions = [
    ...(product.available_actions ?? []),
    ...(product.available_options ?? []),
  ];
  if (!actions.length) return true;
  return orderHasAction(actions, "review", "add_review");
}

export function mapOrderProducts(order: OrderAPIResponse): APIProduct[] {
  const snapshotProducts =
    order.order_details?.customer_snapshot?.products ?? [];
  const orderItems = order.items ?? [];

  if (snapshotProducts.length > 0) {
    return snapshotProducts.map((p) => {
      const matchingItem = orderItems.find(
        (item) =>
          String(item.product_id) === String(p.product_id) ||
          String(item.id) === String(p.id) ||
          String(item.id) === String(p.item_id)
      );

      return {
        ...p,
        product_id: p.product_id || matchingItem?.product_id || "",
        id: p.id || matchingItem?.id || p.item_id,
        name: p.name || p.title || "Product",
        title: p.title || p.name || "Product",
        image: p.image || "",
        quantity: p.quantity ?? 1,
        unit_price: p.unit_price ?? 0,
        total_price: p.total_price ?? 0,
        variant_attributes: p.variant_attributes || [],
        available_actions: p.available_actions?.length
          ? p.available_actions
          : matchingItem?.available_actions,
        available_options: p.available_options?.length
          ? p.available_options
          : matchingItem?.available_options,
      };
    });
  }

  if (orderItems.length > 0) {
    return orderItems.map((item) => ({
      product_id: item.product_id,
      id: item.id,
      item_id: item.id,
      name: "Product",
      title: "Product",
      image: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      variant_attributes: [],
      status: item.status,
    }));
  }

  return [];
}
