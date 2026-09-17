
import { Cart, CartItem } from "@/types/cart";
import { cookies } from "next/headers";

export async function getCheckoutData(): Promise<{
  checkoutProducts: CartItem[];
  cartId: string | null;
  isBuyNow: boolean;
}> {
  const cartApiBaseUrl = process.env.NEXT_PUBLIC_API_URL_CART;

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  const sessionCookie = allCookies.find(
    (c) => c.name === "sessionid" || c.name.includes("session") || c.name === "accessToken"
  );


  const headers = new Headers();
  if (sessionCookie) {
    headers.append("Cookie", `${sessionCookie.name}=${sessionCookie.value}`);
  }

  const options = { headers, cache: "no-store" as RequestCache };

  try {
    const cartRes = await fetch(
      `${cartApiBaseUrl}/api/v1/cart/get-cart`,
      options
    );

    const rawCartResponse = await cartRes.text();


    if (!cartRes.ok) {
       throw new Error(`Failed to fetch cart, status: ${cartRes.status}`);
    }

    const cart: Cart | null = JSON.parse(rawCartResponse);


    return {
      checkoutProducts: cart?.items || [],
      cartId: cart?.id || null,
      isBuyNow: false,
    };
  } catch (error) {
    console.error("[getCheckoutData] Error fetching cart:", error);
    throw error;
  }
}
