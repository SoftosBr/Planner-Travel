"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BudgetCard } from "@/components/home/budget-card";
import { PlannerResult } from "@/components/home/planner-result";
import { SharePlanner } from "@/components/home/share-planner";
import { LayoutContainer } from "@/components/layout/layout-container";
import { Button } from "@/components/ui/button";
import { refreshExchangeRatesInBackground } from "@/lib/exchange-rates";
import {
  createExpenseItem,
  type ExpenseItem,
  getExpensesFromShareQuery,
  getTotalExpenseItems,
  getTotalsByCurrency,
} from "@/lib/planner";

export default function HomePage() {
  const searchParams = useSearchParams();
  const plannerRef = useRef<HTMLElement | null>(null);
  const initialExpenses = useMemo(
    () =>
      getExpensesFromShareQuery(`?${searchParams?.toString() ?? ""}`) ?? [createExpenseItem("expense-0")],
    [searchParams],
  );
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const nextExpenseIdRef = useRef(expenses[0]?.id.startsWith("shared-") ? expenses.length : 1);
  const [isResultOpen, setIsResultOpen] = useState(false);

  useEffect(() => {
    void refreshExchangeRatesInBackground();
  }, []);

  const totalsByCurrency = useMemo(() => getTotalsByCurrency(expenses), [expenses]);
  const totalItems = useMemo(() => getTotalExpenseItems(expenses), [expenses]);

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
      const nextId = `expense-${nextExpenseIdRef.current}`;
      nextExpenseIdRef.current += 1;
      next.splice(index + 1, 0, createExpenseItem(nextId));
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
      <LayoutContainer className="flex flex-col gap-6">
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
      </LayoutContainer>
    </main>
  );
}
