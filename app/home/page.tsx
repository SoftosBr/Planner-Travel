"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BudgetCard, type ExpenseItem } from "@/components/home/budget-card";
import { PlannerResult } from "@/components/home/planner-result";
import { SharePlanner } from "@/components/home/share-planner";
import { Button } from "@/components/ui/button";
import { parseAmountInput } from "@/lib/amounts";
import type { Currency } from "@/lib/currencies";
import { refreshExchangeRatesInBackground } from "@/lib/exchange-rates";

const SHARE_PARAM = "plan";

function createExpenseItem(index: number): ExpenseItem {
  return {
    id: `${Date.now()}-${index}`,
    category: "visa",
    value: "",
    currency: "USD",
  };
}

function getExpensesFromShareQuery(): ExpenseItem[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = new URLSearchParams(window.location.search).get(SHARE_PARAM);
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
      id: `${Date.now()}-${index}`,
      category: item.category,
      value: item.value,
      currency: item.currency,
    }));
  } catch {
    return null;
  }
}

export default function HomePage() {
  const plannerRef = useRef<HTMLElement | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(
    () => getExpensesFromShareQuery() ?? [createExpenseItem(0)],
  );
  const [isResultOpen, setIsResultOpen] = useState(false);

  useEffect(() => {
    void refreshExchangeRatesInBackground();
  }, []);

  const totalsByCurrency = useMemo(() => {
    const totals = new Map<Currency, number>();

    for (const item of expenses) {
      const parsed = parseAmountInput(item.value);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        continue;
      }
      totals.set(item.currency, (totals.get(item.currency) ?? 0) + parsed);
    }

    return Array.from(totals.entries());
  }, [expenses]);

  const totalItems = useMemo(
    () => expenses.filter((item) => parseAmountInput(item.value) > 0).length,
    [expenses],
  );

  function updateExpense(id: string, patch: Partial<ExpenseItem>) {
    setExpenses((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function addLineBelow(id: string) {
    setExpenses((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index < 0) {
        return current;
      }

      const next = [...current];
      next.splice(index + 1, 0, createExpenseItem(current.length));
      return next;
    });
  }

  function removeLine(id: string) {
    setExpenses((current) => {
      if (current.length === 1) {
        return current;
      }
      return current.filter((item) => item.id !== id);
    });
  }

  function handleEnterNavigation(event: React.KeyboardEvent<HTMLElement>) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey
    ) {
      return;
    }

    const target = event.target as HTMLElement;
    const isInput = target.tagName === "INPUT";
    const isComboboxTrigger = target.getAttribute("role") === "combobox";

    if (!isInput && !isComboboxTrigger) {
      return;
    }

    if (target.getAttribute("aria-expanded") === "true") {
      return;
    }

    const root = plannerRef.current;
    if (!root) {
      return;
    }

    const orderedFields = Array.from(
      root.querySelectorAll<HTMLElement>("[data-enter-nav='true']:not([disabled])"),
    );
    const index = orderedFields.indexOf(target);
    if (index === -1) {
      return;
    }

    event.preventDefault();
    const next = orderedFields[index + 1] ?? orderedFields[0];
    next.focus();
  }

  return (
    <main
      ref={plannerRef}
      className="flex min-h-screen w-full flex-col gap-6 pb-10 pt-2"
      onKeyDownCapture={handleEnterNavigation}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6">
        <section>
          <BudgetCard
            expenses={expenses}
            onUpdateExpense={updateExpense}
            onAddBelow={addLineBelow}
            onRemove={removeLine}
          />
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <SharePlanner expenses={expenses} />
            <Button
              size="lg"
              className="w-full sm:w-auto"
              data-enter-nav="true"
              onClick={() => setIsResultOpen(true)}
            >
              Finish planner and calculate
            </Button>
          </div>

          <PlannerResult
            open={isResultOpen}
            onOpenChange={setIsResultOpen}
            totalItems={totalItems}
            totalsByCurrency={totalsByCurrency}
          />
        </section>
      </div>
    </main>
  );
}
