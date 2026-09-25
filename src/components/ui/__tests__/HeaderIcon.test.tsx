import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * HeaderIcon is the wishlist/cart style icon in the header. The badge is
 * count-driven and the className is what lets the header hide the icon per
 * breakpoint, so both are worth pinning.
 */
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

const { default: HeaderIcon } = await import("../HeaderIcon");

const baseProps = {
  href: "/user/wishlist",
  iconSrc: "/images/wishlist.svg",
  alt: "wishlist",
};

afterEach(cleanup);

describe("HeaderIcon", () => {
  it("links to its destination with an accessible image", () => {
    render(<HeaderIcon {...baseProps} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/user/wishlist");
    expect(screen.getByAltText("wishlist")).toBeInTheDocument();
  });

  it("hides the badge at zero", () => {
    render(<HeaderIcon {...baseProps} count={0} />);

    expect(document.querySelector(".wishlist-num")).toBeNull();
  });

  it("hides the badge when no count is passed at all", () => {
    render(<HeaderIcon {...baseProps} />);

    expect(document.querySelector(".wishlist-num")).toBeNull();
  });

  it("shows the badge once there is something to count", () => {
    render(<HeaderIcon {...baseProps} count={4} />);

    expect(document.querySelector(".wishlist-num")).toHaveTextContent("4");
  });

  it("merges the className onto the root so the header can hide it", () => {
    render(
      <HeaderIcon {...baseProps} className="wishlist hidden lg:block" />,
    );

    const root = document.querySelector(".header-link") as HTMLElement;
    expect(root.className).toContain("wishlist");
    expect(root.className).toContain("hidden");
    expect(root.className).toContain("lg:block");
  });
});
