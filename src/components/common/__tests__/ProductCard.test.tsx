import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * ProductCard is the most-rendered component in the app and is shared by the
 * listing pages and the wishlist, so these lock down the parts that differ per
 * page: the optional price/rating rows, the out-of-stock guards, and the
 * reserved brand line that keeps both pages' Add To Cart buttons aligned even
 * when the wishlist API omits brand_name.
 *
 * Everything the card pulls from Redux, the router or toast is mocked so the
 * suite stays a pure render test.
 */
const addToCart = vi.fn();
const unwrap = vi.fn();
const toggle = vi.fn();
const toastError = vi.fn();
const toastSuccess = vi.fn();

let wishlistState = { isWishlisted: false, isLoading: false };

vi.mock("next/image", () => ({
  // next/image's own props (fill, priority, sizes...) are not valid on a bare
  // <img>, so drop them rather than let React warn on every render.
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === "string" ? src : ""} alt={alt} className={className} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}));

vi.mock("@/lib/redux/apis/cart-api", () => ({
  useAddToCartMutation: () => [addToCart, { isLoading: false }],
}));

vi.mock("@/lib/hooks/use-wishlist-toggle", () => ({
  useWishlistToggle: () => ({ ...wishlistState, toggle }),
}));

vi.mock("@/lib/hooks/use-global-postcode", () => ({
  useGlobalPostcode: () => ({ postcode: "3000" }),
}));

const { default: ProductCard } = await import("../ProductCard");

const baseProps = {
  image: "/images/product.png",
  id: "prod-1",
  unique_code: "ABC123",
  title: "Kinderfeets Kinderboard Natural Wooden Balance Board",
  brand_name: "Kinderfeets",
  mainPrice: 43.99,
  vendor_id: "vendor-9",
  defaultVariantId: "var-1",
};

beforeEach(() => {
  vi.clearAllMocks();
  wishlistState = { isWishlisted: false, isLoading: false };
  addToCart.mockReturnValue({ unwrap });
  unwrap.mockResolvedValue({});
});

afterEach(cleanup);

const brandHeading = () => document.querySelector("h4");

// The cart button sits inside the product link; the wishlist button is a
// sibling outside it. Scoping to the link keeps the two apart when the card is
// out of stock and both are labelled "out of stock".
const addToCartButton = () =>
  within(screen.getByRole("link")).getByRole("button");

describe("ProductCard", () => {
  it("shows the brand, price and a link to the product", () => {
    render(<ProductCard {...baseProps} />);

    expect(screen.getByText("Kinderfeets")).toBeInTheDocument();
    expect(screen.getByText("$43.99")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/product/ABC123");
  });

  it("falls back to the id when the product has no unique_code", () => {
    render(<ProductCard {...baseProps} unique_code={undefined} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/product/prod-1");
  });

  it("truncates a long title to seven words", () => {
    render(<ProductCard {...baseProps} />);

    expect(
      screen.getByText("Kinderfeets Kinderboard Natural Wooden Balance Board"),
    ).toBeInTheDocument();
  });

  it("reserves the brand line even when brand_name is missing", () => {
    // The wishlist API does not return brand_name. Without a reserved height
    // the empty h4 collapses and the Add To Cart button drops ~21px lower
    // than on the listing pages.
    render(<ProductCard {...baseProps} brand_name={undefined} />);

    const heading = brandHeading();
    expect(heading).toBeTruthy();
    expect(heading).toHaveTextContent("");
    expect(heading?.className).toContain("min-h-[17px]");
    expect(heading?.className).toContain("md:min-h-[21px]");
  });

  it("hides the was-price until showWasPrice is set", () => {
    const { unmount } = render(
      <ProductCard {...baseProps} wasPrice={65.99} />,
    );
    expect(screen.queryByText("$65.99")).not.toBeInTheDocument();
    unmount();

    render(<ProductCard {...baseProps} wasPrice={65.99} showWasPrice />);
    expect(screen.getByText("$65.99")).toBeInTheDocument();
  });

  it("shows the discount badge only when a percentage is given", () => {
    const { unmount } = render(<ProductCard {...baseProps} />);
    expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
    unmount();

    render(<ProductCard {...baseProps} discountPercentage={33.34} />);
    expect(screen.getByText("33.34% OFF")).toBeInTheDocument();
  });

  it("omits the rating row when there are no reviews", () => {
    render(<ProductCard {...baseProps} rating={0} reviewCount={0} />);

    expect(screen.queryByText("(0)")).not.toBeInTheDocument();
  });

  it("renders the review count once a rating exists", () => {
    render(<ProductCard {...baseProps} rating={4.5} reviewCount={12} />);

    expect(screen.getByText("(12)")).toBeInTheDocument();
  });

  it("adds to cart with the variant, vendor and postcode", () => {
    render(<ProductCard {...baseProps} />);

    fireEvent.click(addToCartButton());

    expect(addToCart).toHaveBeenCalledWith({
      productId: "prod-1",
      quantity: 1,
      variant_id: "var-1",
      vendor_id: "vendor-9",
      postcode: "3000",
    });
  });

  it("marks the card out of stock and blocks add to cart", () => {
    render(<ProductCard {...baseProps} stock={0} />);

    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
    const button = addToCartButton();
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(addToCart).not.toHaveBeenCalled();
  });

  it("treats a variant with no stock as out of stock", () => {
    render(
      <ProductCard
        {...baseProps}
        stock={10}
        variants={[{ id: "var-1", stock: 0 }] as never}
      />,
    );

    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });

  it("toggles the wishlist", () => {
    render(<ProductCard {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Add to wishlist" }));

    expect(toggle).toHaveBeenCalledTimes(1);
    expect(toastError).not.toHaveBeenCalled();
  });

  it("refuses to wishlist an out-of-stock product", () => {
    render(<ProductCard {...baseProps} stock={0} />);

    fireEvent.click(screen.getByRole("button", { name: "Out of stock" }));

    expect(toggle).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith("This product is out of stock");
  });

  it("labels the wishlist control as a removal once the item is saved", () => {
    wishlistState = { isWishlisted: true, isLoading: false };
    render(<ProductCard {...baseProps} />);

    expect(
      screen.getByRole("button", { name: "Remove from wishlist" }),
    ).toBeInTheDocument();
  });
});
