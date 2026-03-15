import { describe, expect, it } from "vitest";
import { convertCurrencyAmount, type ExchangeRates } from "@/lib/exchange-rates";

describe("convertCurrencyAmount", () => {
  const rates: ExchangeRates = {
    BRL: 5,
    EUR: 0.5,
    JPY: 100,
    KRW: 1000,
    USD: 1,
  };

  it("converts through USD-based rates", () => {
    expect(convertCurrencyAmount(10, "USD", "EUR", rates)).toBe(5);
    expect(convertCurrencyAmount(10, "BRL", "USD", rates)).toBe(2);
    expect(convertCurrencyAmount(10, "BRL", "JPY", rates)).toBe(200);
  });

  it("returns the same amount for identical currencies", () => {
    expect(convertCurrencyAmount(15, "USD", "USD", rates)).toBe(15);
  });
});

