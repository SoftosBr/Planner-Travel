export function formatAmountInput(value: string) {
  const normalized = value.replaceAll(",", "").replace(/[^\d.]/g, "");
  const [rawInteger = "", ...rawDecimalParts] = normalized.split(".");
  const integer = rawInteger.replace(/^0+(?=\d)/, "");
  const decimal = rawDecimalParts.join("").slice(0, 2);
  const hasTrailingDecimal = normalized.endsWith(".") && decimal.length === 0;
  const formattedInteger =
    integer.length > 0 ? Number.parseInt(integer, 10).toLocaleString("en-US") : "";

  if (hasTrailingDecimal) {
    return `${formattedInteger || "0"}.`;
  }

  if (decimal.length > 0) {
    return `${formattedInteger || "0"}.${decimal}`;
  }

  return formattedInteger;
}

export function parseAmountInput(value: string) {
  const parsed = Number.parseFloat(value.replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

