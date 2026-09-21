import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CartItem } from "@/types/cart";

/**
 * CartPopup drives the header cart icon. Two things matter: the badge count
 * only counts items a shopper can actually buy, and the optional className
 * reaches the root element — that is how the header hides the icon below lg
 * while keeping it on the listing pages, where the Sort/Filter bar covers the
 * mobile bottom nav.
 */
let cartData: { items: Partial<CartItem>[] } | undefined;

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === "string" ? src : ""} alt={alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/redux/apis/cart-api", () => ({
  useGetCartQuery: () => ({ data: cartData }),
}));

vi.mock("@/lib/hooks/use-global-postcode", () => ({
  useGlobalPostcode: () => ({ postcode: "3000" }),
}));

const { default: CartPopup } = await import("../CartPopup");

const root = () => document.querySelector(".header-link.cart") as HTMLElement;

beforeEach(() => {
  cartData = { items: [] };
});

afterEach(cleanup);

describe("CartPopup", () => {
  it("links to the cart", () => {
    render(<CartPopup isVisible={false} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/cart");
  });

  it("shows no badge for an empty cart", () => {
    render(<CartPopup isVisible={false} />);

    expect(document.querySelector(".cart-num")).toBeNull();
  });

  it("counts only active, in-stock items", () => {
    cartData = {
      items: [
        { is_active: true, available_stock: 5 },
        { is_active: true, available_stock: 0 }, // out of stock
        { is_active: false, available_stock: 9 }, // inactive
        { is_active: true }, // stock unknown -> still counted
      ],
    };
    render(<CartPopup isVisible={false} />);

    expect(document.querySelector(".cart-num")).toHaveTextContent("2");
  });

  it("survives the cart query returning nothing", () => {
    cartData = undefined;
    render(<CartPopup isVisible={false} />);

    expect(screen.getByRole("link")).toBeInTheDocument();
    expect(document.querySelector(".cart-num")).toBeNull();
  });

  it("marks itself visible only when asked", () => {
    const { unmount } = render(<CartPopup isVisible={false} />);
    expect(root().className).not.toContain("is-visible");
    unmount();

    render(<CartPopup isVisible />);
    expect(root().className).toContain("is-visible");
  });

  it("applies the responsive className the header passes in", () => {
    render(<CartPopup isVisible={false} className="hidden lg:block" />);

    expect(root().className).toContain("hidden");
    expect(root().className).toContain("lg:block");
  });

  it("keeps its base classes when no className is given", () => {
    render(<CartPopup isVisible={false} />);

    expect(root().className).toContain("header-link");
    expect(root().className).toContain("cart");
  });
});
