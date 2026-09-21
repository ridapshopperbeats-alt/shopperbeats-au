import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Pagination from "../Pagination";

/**
 * Pagination owns the page-window maths for every listing page, so the cases
 * that matter are the boundaries: which numbers show near page 1, in the
 * middle and at the end, plus the guard that stops it emitting a change for a
 * page that does not exist.
 *
 * Clicks go through fireEvent rather than user-event, which this project does
 * not depend on.
 */
afterEach(cleanup);

const setup = (props: Partial<React.ComponentProps<typeof Pagination>> = {}) => {
  const onPageChange = vi.fn();
  render(
    <Pagination
      currentPage={1}
      totalPages={10}
      totalItems={200}
      itemsPerPage={20}
      onItemsPerPageChange={vi.fn()}
      onPageChange={onPageChange}
      {...props}
    />,
  );
  return { onPageChange };
};

const visiblePages = () =>
  screen
    .getAllByRole("button")
    .map((b) => b.textContent?.trim() ?? "")
    .filter((t) => /^\d+$/.test(t));

describe("Pagination", () => {
  it("renders nothing when there are no items", () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={0}
        totalItems={0}
        itemsPerPage={20}
        onItemsPerPageChange={vi.fn()}
        onPageChange={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("lists every page without an ellipsis when the count fits the window", () => {
    setup({ totalPages: 4, totalItems: 80 });

    expect(visiblePages()).toEqual(["1", "2", "3", "4"]);
    expect(screen.queryByText("...")).not.toBeInTheDocument();
  });

  it("anchors the window to the first pages while near the start", () => {
    setup({ currentPage: 2, totalPages: 132 });

    expect(visiblePages()).toEqual(["1", "2", "3", "4", "5", "132"]);
    expect(screen.getAllByText("...")).toHaveLength(1);
  });

  it("puts a gap on both sides once the window is in the middle", () => {
    setup({ currentPage: 50, totalPages: 132 });

    expect(visiblePages()).toEqual(["1", "48", "49", "50", "51", "52", "132"]);
    expect(screen.getAllByText("...")).toHaveLength(2);
  });

  it("anchors the window to the last pages while near the end", () => {
    setup({ currentPage: 131, totalPages: 132 });

    expect(visiblePages()).toEqual(["1", "128", "129", "130", "131", "132"]);
  });

  it("disables previous on the first page", () => {
    setup({ currentPage: 1, totalPages: 10 });

    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).toBeEnabled();
  });

  it("disables next once the last page is current", () => {
    setup({ currentPage: 10, totalPages: 10 });

    expect(screen.getByLabelText("Next page")).toBeDisabled();
    expect(screen.getByLabelText("Previous page")).toBeEnabled();
  });

  it("reports the page the user picked", () => {
    const { onPageChange } = setup({ currentPage: 1, totalPages: 10 });

    fireEvent.click(screen.getByRole("button", { name: "3" }));

    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("steps forward and back through the arrows", () => {
    const { onPageChange } = setup({ currentPage: 5, totalPages: 10 });

    fireEvent.click(screen.getByLabelText("Next page"));
    fireEvent.click(screen.getByLabelText("Previous page"));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 6);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 4);
  });

  it("ignores a click on the page that is already current", () => {
    const { onPageChange } = setup({ currentPage: 3, totalPages: 10 });

    fireEvent.click(screen.getByRole("button", { name: "3" }));

    expect(onPageChange).not.toHaveBeenCalled();
  });
});
