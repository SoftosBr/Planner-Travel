import { parseAmountInput } from "@/lib/amounts";
import type { Currency } from "@/lib/currencies";

export type ExpenseCategory = "visa" | "plane-ticket" | "accommodation" | "others";

export type ExpenseItem = {
  id: string;
  category: ExpenseCategory;
  value: string;
  currency: Currency;
};

export const SHARE_PARAM = "plan";

export function createExpenseItem(id: string): ExpenseItem {
  return {
    id,
    category: "visa",
    value: "",
    currency: "USD",
  };
}

export function getExpensesFromShareQuery(search: string): ExpenseItem[] | null {
  const rawValue = new URLSearchParams(search).get(SHARE_PARAM);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(rawValue)) as Array<{
      category: ExpenseItem["category"];
      value: string;
      currency: Currency;
    }>;

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }

    return parsed.map((item, index) => ({
      id: `shared-${index}`,
      category: item.category,
      value: item.value,
      currency: item.currency,
    }));
  } catch {
    return null;
  }
}

export function getTotalsByCurrency(expenses: ExpenseItem[]) {
  const totals = new Map<Currency, number>();

  for (const item of expenses) {
    const parsed = parseAmountInput(item.value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      continue;
    }

    totals.set(item.currency, (totals.get(item.currency) ?? 0) + parsed);
  }

  return Array.from(totals.entries());
}

export function getTotalExpenseItems(expenses: ExpenseItem[]) {
  return expenses.filter((item) => parseAmountInput(item.value) > 0).length;
}
