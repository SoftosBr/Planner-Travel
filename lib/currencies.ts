export const supportedCurrencies = ["EUR", "BRL", "USD", "JPY", "KRW"] as const;

export type Currency = (typeof supportedCurrencies)[number];

export const currencyOptions: ReadonlyArray<{ value: Currency; label: string }> = [
  { value: "EUR", label: "🇪🇺 EUR - Euro" },
  { value: "BRL", label: "🇧🇷 BRL - Brazilian Real" },
  { value: "USD", label: "🇺🇸 USD - US Dollar" },
  { value: "JPY", label: "🇯🇵 JPY - Japanese Yen" },
  { value: "KRW", label: "🇰🇷 KRW - Korean Won" },
];

export function getCurrencyOption(currency: Currency) {
  return currencyOptions.find((option) => option.value === currency);
}

export function getCurrencyLabel(currency: Currency) {
  return getCurrencyOption(currency)?.label ?? currency;
}
