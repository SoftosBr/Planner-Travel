"use client";

import { useMemo, useState } from "react";
import { MoonStarIcon, SunIcon } from "lucide-react";
import { BudgetCard, type Currency, type ExpenseItem } from "@/components/home/budget-card";
import { PlannerResult } from "@/components/home/planner-result";
import { Button } from "@/components/ui/button";

function createExpenseItem(index: number): ExpenseItem {
  return {
    id: `${Date.now()}-${index}`,
    category: "visa",
    value: "",
    currency: "USD",
  };
}

export default function HomePage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([createExpenseItem(0)]);
  const [showResult, setShowResult] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const totalsByCurrency = useMemo(() => {
    const totals = new Map<Currency, number>();

    for (const item of expenses) {
      const parsed = Number.parseFloat(item.value);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        continue;
      }
      totals.set(item.currency, (totals.get(item.currency) ?? 0) + parsed);
    }

    return Array.from(totals.entries());
  }, [expenses]);

  const totalItems = useMemo(
    () => expenses.filter((item) => Number.parseFloat(item.value) > 0).length,
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

  function toggleTheme() {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    setIsDark(nextIsDark);
  }

  return (
    <main className="flex min-h-screen w-full flex-col gap-6 pb-10">
      <header className="sticky top-0 z-30 w-full border-b border-border/70 bg-background/92 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Travel Planner</p>
            <h1 className="text-xl leading-tight font-semibold text-foreground sm:text-2xl [font-family:var(--font-display)]">
              Home budget board
            </h1>
          </div>
          <Button variant="outline" onClick={toggleTheme}>
            {isDark ? <SunIcon data-icon="inline-start" /> : <MoonStarIcon data-icon="inline-start" />}
            {isDark ? "Light mode" : "Dark mode"}
          </Button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6">
        <section className="pt-2">
          <BudgetCard
            expenses={expenses}
            onUpdateExpense={updateExpense}
            onAddBelow={addLineBelow}
            onRemove={removeLine}
          />
        </section>

        <section className="flex flex-col gap-4">
          <Button size="lg" className="w-full sm:w-auto" onClick={() => setShowResult(true)}>
            Finish planner and calculate
          </Button>

          {showResult ? (
            <PlannerResult totalItems={totalItems} totalsByCurrency={totalsByCurrency} />
          ) : null}
        </section>
      </div>
    </main>
  );
}
