import { OrderAPIResponse } from "@/types/order";

export const STATIC_ORDERS: OrderAPIResponse[] = [
  {
    id: "static-order-1",
    order_number: "SB-100234",
    status: "Delivered",
    shipstation_order_status: "delivered",
    total_amount: 249.99,
    currency: "USD",
    estimated_delivery_date: "2026-06-18T00:00:00.000Z",
    subtotal: 249.99,
    created_at: new Date("2026-06-12T10:00:00.000Z"),
    shipping_cost: 0,
    discount_amount: 0,
    order_details: {
      shipping_first_name: "John",
      shipping_last_name: "Doe",
      shipping_address: "123 Static Street",
      shipping_city: "Sydney",
      shipping_state: "NSW",
      shipping_postal_code: "2000",
      shipping_country: "Australia",
      shipping_phone: "0400000000",
      customer_snapshot: {
        products: [
          {
            name: "Vevor Swing Set",
            title: "Vevor Swing Set",
            image:
              "https://image.vevor.com/us%2FZZWDQQLHZZWD6R25UV0%2Foriginal_img-v1%2Fswing-m100-11.jpg?timestamp=1721270260000",
            quantity: 1,
            product_id: "static-product-1",
            unit_price: 249.99,
            total_price: 249.99,
            unique_code: "static-product-1",
            id: "static-item-1",
            item_id: "static-item-1",
            status: "delivered",
            variant_attributes: [{ name: "Color", value: "Green" }],
            available_actions: ["review", "return", "replace"],
          },
        ],
        payment_method: { type: "Credit Card" },
        shipping_address: {
          address: "123 Static Street",
          city: "Sydney",
          state: "NSW",
          postal_code: "2000",
          country: "Australia",
        },
      },
    },
    items: [
      {
        id: "static-item-1",
        product_id: "static-product-1",
        status: "delivered",
        available_actions: ["review", "return", "replace"],
        available_options: ["review", "return", "replace"],
      },
    ],
    total_saving: 0,
    available_actions: ["review", "return", "replace"],
    tracking_link: "",
    returns: [],
  },
  {
    id: "static-order-2",
    order_number: "SB-100235",
    status: "In Progress",
    shipstation_order_status: "in_progress",
    total_amount: 89.5,
    currency: "USD",
    estimated_delivery_date: "2026-07-28T00:00:00.000Z",
    subtotal: 89.5,
    created_at: new Date("2026-07-01T10:00:00.000Z"),
    shipping_cost: 0,
    discount_amount: 0,
    order_details: {
      shipping_first_name: "Jane",
      shipping_last_name: "Doe",
      shipping_address: "456 Static Avenue",
      shipping_city: "Melbourne",
      shipping_state: "VIC",
      shipping_postal_code: "3000",
      shipping_country: "Australia",
      shipping_phone: "0400000001",
      customer_snapshot: {
        products: [
          {
            name: "Bambury Towel Set",
            title: "Bambury Towel Set",
            image: "/images/image-coming-soon.jpg",
            quantity: 2,
            product_id: "static-product-2",
            unit_price: 44.75,
            total_price: 89.5,
            unique_code: "static-product-2",
            id: "static-item-2",
            item_id: "static-item-2",
            status: "in_progress",
            variant_attributes: [{ name: "Size", value: "Large" }],
            available_actions: ["cancel"],
          },
        ],
        payment_method: { type: "PayPal" },
        shipping_address: {
          address: "456 Static Avenue",
          city: "Melbourne",
          state: "VIC",
          postal_code: "3000",
          country: "Australia",
        },
      },
    },
    items: [
      {
        id: "static-item-2",
        product_id: "static-product-2",
        status: "in_progress",
        available_actions: ["cancel"],
        available_options: ["cancel"],
      },
    ],
    total_saving: 0,
    available_actions: ["cancel", "retry_payment"],
    tracking_link: "",
    returns: [],
  },
];

export const STATIC_ORDER_IDS = STATIC_ORDERS.map((o) => o.id);

export function getStaticOrder(orderId: string): OrderAPIResponse | undefined {
  return STATIC_ORDERS.find((o) => o.id === orderId);
}

export function isStaticOrderId(orderId: string): boolean {
  return STATIC_ORDER_IDS.includes(orderId);
}
