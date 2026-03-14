"use client";

import { useMemo, useState } from "react";
import { MoonStarIcon, PlusIcon, SunIcon, WalletCardsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ExpenseCategory = "visa" | "plane-ticket" | "accommodation" | "others";
type Currency = "EUR" | "BRL" | "USD" | "JPY" | "KRW";

type ExpenseItem = {
  id: string;
  category: ExpenseCategory;
  value: string;
  currency: Currency;
};

const categoryOptions: { value: ExpenseCategory; label: string }[] = [
  { value: "visa", label: "Visa" },
  { value: "plane-ticket", label: "Plane ticket" },
  { value: "accommodation", label: "Accommodation" },
  { value: "others", label: "Others" },
];

const currencyOptions: { value: Currency; label: string }[] = [
  { value: "EUR", label: "EUR - Euro" },
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "USD", label: "USD - American Dollar" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "KRW", label: "KRW - Korean Won" },
];

function createExpenseItem(index: number): ExpenseItem {
  return {
    id: `${Date.now()}-${index}`,
    category: "visa",
    value: "",
    currency: "USD",
  };
}

export default function Home() {
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

  function addExpense() {
    setExpenses((current) => [...current, createExpenseItem(current.length)]);
  }

  function updateExpense(id: string, patch: Partial<ExpenseItem>) {
    setExpenses((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function finishPlanner() {
    setShowResult(true);
  }

  function toggleTheme() {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    setIsDark(nextIsDark);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-12">
      <header className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 backdrop-blur sm:p-8">
        <div className="absolute -top-20 right-8 size-44 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-16 -left-8 size-40 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
              Travel Budget Control
            </p>
            <h1 className="text-3xl leading-tight font-semibold sm:text-4xl [font-family:var(--font-display)]">
              Planner for your trip expenses
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Add every planned spend, choose category and currency, then finish your
              planner to see the final totals.
            </p>
          </div>
          <Button variant="outline" onClick={toggleTheme}>
            {isDark ? <SunIcon data-icon="inline-start" /> : <MoonStarIcon data-icon="inline-start" />}
            {isDark ? "Light mode" : "Dark mode"}
          </Button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="flex flex-col gap-4">
          {expenses.map((item, index) => (
            <Card
              key={item.id}
              className="border-border/70 bg-card/90 backdrop-blur"
            >
              <CardHeader className="gap-2">
                <CardTitle className="text-base">Expense #{index + 1}</CardTitle>
                <CardDescription>
                  Fill in category, budgeted value, and currency for this expense.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`category-${item.id}`}>Category</Label>
                  <Select
                    value={item.category}
                    onValueChange={(value) => updateExpense(item.id, { category: value as ExpenseCategory })}
                  >
                    <SelectTrigger id={`category-${item.id}`} className="w-full">
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Spends</SelectLabel>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`value-${item.id}`}>Budgeted value</Label>
                  <Input
                    id={`value-${item.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="0.00"
                    value={item.value}
                    onChange={(event) => updateExpense(item.id, { value: event.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`currency-${item.id}`}>Currency</Label>
                  <Select
                    value={item.currency}
                    onValueChange={(value) => updateExpense(item.id, { currency: value as Currency })}
                  >
                    <SelectTrigger id={`currency-${item.id}`} className="w-full">
                      <SelectValue placeholder="Choose currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Currencies</SelectLabel>
                        {currencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit border-border/70 bg-card/90 lg:sticky lg:top-6 lg:self-start">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletCardsIcon />
              Add new expense
            </CardTitle>
            <CardDescription>
              Add as many expense rows as you need before finishing.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={addExpense}>
              <PlusIcon data-icon="inline-start" />
              Add expense form
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="mt-2 flex flex-col gap-4">
        <Button size="lg" className="w-full sm:w-auto" onClick={finishPlanner}>
          Finish planner and calculate
        </Button>

        {showResult ? (
          <Card className="border-border/70 bg-card/95">
            <CardHeader>
              <CardTitle>Planner result</CardTitle>
              <CardDescription>
                {totalItems} expense item(s) with a valid value included in the total.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {totalsByCurrency.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No valid values to calculate yet. Enter a value greater than zero.
                </p>
              ) : (
                totalsByCurrency.map(([currency, total]) => (
                  <div
                    key={currency}
                    className="flex items-center justify-between rounded-lg border border-border/70 bg-background/50 px-3 py-2"
                  >
                    <span className="text-sm text-muted-foreground">{currency}</span>
                    <span className="text-base font-semibold">{total.toFixed(2)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : null}
      </section>
    </main>
  );
}
