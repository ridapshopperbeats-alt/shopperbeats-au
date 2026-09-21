import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import StarRating from "../StarRating";

/**
 * StarRating always draws five stars and colours them from the score, so the
 * thing worth pinning down is how many end up filled for whole, fractional and
 * out-of-range ratings.
 */
afterEach(cleanup);

const FILLED = "fill-[#FFCB45]";

const starClasses = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("svg")).map(
    (s) => s.getAttribute("class") ?? "",
  );

const filledCount = (container: HTMLElement) =>
  starClasses(container).filter((c) => c.includes(FILLED)).length;

describe("StarRating", () => {
  it("always renders five stars", () => {
    const { container } = render(<StarRating rating={3} />);

    expect(container.querySelectorAll("svg")).toHaveLength(5);
  });

  it("fills exactly as many stars as a whole rating", () => {
    const { container } = render(<StarRating rating={4} />);

    expect(filledCount(container)).toBe(4);
  });

  it("leaves every star empty at zero", () => {
    const { container } = render(<StarRating rating={0} />);

    expect(filledCount(container)).toBe(0);
  });

  it("counts the partial star as filled for a fractional rating", () => {
    // 3.5 -> three whole stars plus the half, which the component colours in.
    const { container } = render(<StarRating rating={3.5} />);

    expect(filledCount(container)).toBe(4);
  });

  it("never fills more than five even if the rating overflows", () => {
    const { container } = render(<StarRating rating={9} />);

    expect(filledCount(container)).toBe(5);
  });

  it("passes the size through to each star", () => {
    const { container } = render(<StarRating rating={2} size={24} />);

    for (const svg of container.querySelectorAll("svg")) {
      expect(svg).toHaveAttribute("width", "24");
    }
  });
});
