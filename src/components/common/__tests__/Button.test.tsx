import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Button from "../Button";

/**
 * Button debounces its onClick, which is what stops a double-tap from placing
 * two orders. Timers are faked so the tests assert the collapse and the delay
 * rather than waiting on wall-clock time.
 */
beforeEach(() => vi.useFakeTimers());

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  cleanup();
});

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Add To Cart</Button>);

    expect(screen.getByRole("button", { name: "Add To Cart" })).toBeInTheDocument();
  });

  it("waits for the debounce window before firing onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Send</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("collapses a burst of clicks into one call", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Send</Button>);

    const button = screen.getByRole("button");
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    vi.advanceTimersByTime(500);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("honours a custom debounce delay", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} debounceDelay={1000}>
        Send
      </Button>,
    );

    fireEvent.click(screen.getByRole("button"));
    vi.advanceTimersByTime(500);
    expect(onClick).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled while loading", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} isLoading>
        Send
      </Button>,
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("stays disabled when the disabled prop is set", () => {
    render(<Button disabled>Send</Button>);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("forwards arbitrary props such as type and aria-label", () => {
    render(
      <Button type="submit" aria-label="Subscribe">
        Go
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Subscribe" });
    expect(button).toHaveAttribute("type", "submit");
  });
});
