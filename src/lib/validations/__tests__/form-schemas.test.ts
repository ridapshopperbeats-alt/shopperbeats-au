import { describe, expect, it } from "vitest";

import {
  australianPhoneNumber,
  pincode,
  strongPassword,
} from "../form-schemas";

/** Yup throws on the first failure, so this reduces a check to a boolean. */
function accepts(schema: { validateSync: (value: unknown) => unknown }, value: unknown) {
  try {
    schema.validateSync(value);
    return true;
  } catch {
    return false;
  }
}

describe("pincode (Australian postcode)", () => {
  it("accepts a four-digit postcode", () => {
    for (const value of ["6000", "0800", "3029"]) {
      expect(accepts(pincode, value)).toBe(true);
    }
  });

  it("rejects anything that is not exactly four digits", () => {
    for (const value of ["600", "60000", "6O00", "60 0", "", "SW1A"]) {
      expect(accepts(pincode, value)).toBe(false);
    }
  });
});

describe("australianPhoneNumber", () => {
  it("accepts both accepted AU mobile forms", () => {
    expect(accepts(australianPhoneNumber, "0412345678")).toBe(true);
    expect(accepts(australianPhoneNumber, "+61412345678")).toBe(true);
  });

  it("rejects landlines, wrong prefixes and wrong lengths", () => {
    for (const value of [
      "0312345678", // landline
      "041234567", // one digit short
      "04123456789", // one digit long
      "+61312345678", // +61 but not a mobile
      "+614123456789", // too long
      "412345678", // missing leading 0
      "",
    ]) {
      expect(accepts(australianPhoneNumber, value)).toBe(false);
    }
  });
});

describe("strongPassword", () => {
  it("accepts a password meeting every rule", () => {
    expect(accepts(strongPassword, "Passw0rd!")).toBe(true);
  });

  it("requires at least eight characters", () => {
    expect(accepts(strongPassword, "Pw0rd!a")).toBe(false);
  });

  it("requires upper, lower, digit and symbol", () => {
    expect(accepts(strongPassword, "password1!")).toBe(false); // no uppercase
    expect(accepts(strongPassword, "PASSWORD1!")).toBe(false); // no lowercase
    expect(accepts(strongPassword, "Password!!")).toBe(false); // no digit
    expect(accepts(strongPassword, "Password11")).toBe(false); // no symbol
  });

  it("rejects an empty password", () => {
    expect(accepts(strongPassword, "")).toBe(false);
  });
});
