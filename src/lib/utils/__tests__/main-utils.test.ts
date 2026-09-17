import { describe, expect, it } from "vitest";
import type { ChangeEvent } from "react";

import { handleAustralianPhoneNumberChange, toSafeJsonLd } from "../main-utils";

/** The helper only ever reads event.target.value. */
function change(value: string) {
  return { target: { value } } as ChangeEvent<HTMLInputElement>;
}

/** The six characters a backslash-u escape is made of, written without one. */
const ESCAPED_LT = String.fromCharCode(92) + "u003c";

describe("toSafeJsonLd", () => {
  it("serialises plain objects", () => {
    expect(toSafeJsonLd({ "@type": "Product", name: "Basket" })).toBe(
      '{"@type":"Product","name":"Basket"}',
    );
  });

  it("escapes < so injected markup cannot close the script tag", () => {
    const output = toSafeJsonLd({ name: "</script><img onerror=alert(1)>" });

    expect(output).not.toContain("<");
    expect(output).toContain(ESCAPED_LT);
  });

  it("escapes every < in the payload, not just the first", () => {
    const output = toSafeJsonLd({ a: "<", b: "<" });

    expect(output.split(ESCAPED_LT)).toHaveLength(3);
    expect(output).not.toContain("<");
  });

  it("stays parseable after escaping, so the escape is lossless", () => {
    const value = "</script>";

    expect(JSON.parse(toSafeJsonLd({ value }))).toEqual({ value });
  });
});

describe("handleAustralianPhoneNumberChange", () => {
  it("accepts a local mobile being typed progressively", () => {
    expect(handleAustralianPhoneNumberChange(change("0"), "")).toEqual({
      value: "0",
      error: null,
    });
    expect(handleAustralianPhoneNumberChange(change("04"), "0")).toEqual({
      value: "04",
      error: null,
    });
    expect(
      handleAustralianPhoneNumberChange(change("0412345678"), "041234567"),
    ).toEqual({ value: "0412345678", error: null });
  });

  it("accepts the +61 international form", () => {
    expect(
      handleAustralianPhoneNumberChange(change("+61412345678"), "+6141234567"),
    ).toEqual({ value: "+61412345678", error: null });
  });

  it("rejects a local number that does not start with 04", () => {
    const result = handleAustralianPhoneNumberChange(change("03"), "0");

    expect(result.value).toBe("0");
    expect(result.error).toBe("Australian mobile must start with 04");
  });

  it("rejects an international number that is not +614", () => {
    expect(handleAustralianPhoneNumberChange(change("+62"), "+6").error).toBe(
      "Must start with +61",
    );
    expect(handleAustralianPhoneNumberChange(change("+615"), "+61").error).toBe(
      "Australian mobile must start with +614",
    );
  });

  it("rejects letters and other punctuation", () => {
    const result = handleAustralianPhoneNumberChange(change("04a"), "04");

    expect(result.value).toBe("04");
    expect(result.error).toBe("Only numbers and '+' allowed");
  });

  it("rejects more than one plus sign", () => {
    expect(handleAustralianPhoneNumberChange(change("++61"), "+61").error).toBe(
      "Only one '+' allowed",
    );
  });

  it("holds the previous value once the number is over length", () => {
    const tooLong = handleAustralianPhoneNumberChange(
      change("04123456789"),
      "0412345678",
    );

    expect(tooLong.value).toBe("0412345678");
    expect(tooLong.error).toBeNull();
  });
});
