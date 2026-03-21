"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { CurrencySelect } from "@/components/home/currency-select";
import { PlannerFormField } from "@/components/home/planner-form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatAmountInput } from "@/lib/amounts";
import type { ExpenseCategory, ExpenseItem } from "@/lib/planner";

type BudgetCardProps = {
  expenses: ExpenseItem[];
  onUpdateExpense: (id: string, patch: Partial<ExpenseItem>) => void;
  onAddBelow: (id: string) => void;
  onRemove: (id: string) => void;
};

const categoryOptions: { value: ExpenseCategory; label: string }[] = [
  { value: "visa", label: "Visa" },
  { value: "plane-ticket", label: "Plane ticket" },
  { value: "accommodation", label: "Accommodation" },
  { value: "others", label: "Others" },
];

export function BudgetCard({ expenses, onUpdateExpense, onAddBelow, onRemove }: BudgetCardProps) {
  return (
    <Card className="border-border/70 bg-card/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl [font-family:var(--font-display)]">Budget lines</CardTitle>
        <CardDescription>
          Keep all expenses in one list. Use + to insert a new line below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        {expenses.map((item, index) => {
          const isLastLine = index === expenses.length - 1;
          const canRemove = expenses.length > 1;
          const rowClassName =
            index === 0
              ? "grid gap-4 pb-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
              : "grid gap-4 border-t border-border/70 py-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end";

          return (
            <div key={item.id} className={rowClassName}>
              <PlannerFormField htmlFor={`category-${item.id}`} label="Category">
                <Select
                  value={item.category}
                  onValueChange={(value) => onUpdateExpense(item.id, { category: value as ExpenseCategory })}
                >
                  <SelectTrigger
                    id={`category-${item.id}`}
                    className="w-full"
                    data-enter-nav="true"
                  >
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
              </PlannerFormField>

              <PlannerFormField htmlFor={`value-${item.id}`} label="Budgeted value">
                <Input
                  id={`value-${item.id}`}
                  type="text"
                  inputMode="decimal"
                  data-enter-nav="true"
                  placeholder="0.00"
                  value={item.value}
                  onChange={(event) =>
                    onUpdateExpense(item.id, { value: formatAmountInput(event.target.value) })
                  }
                />
              </PlannerFormField>

              <PlannerFormField htmlFor={`currency-${item.id}`} label="Currency">
                <CurrencySelect
                  id={`currency-${item.id}`}
                  className="w-full"
                  data-enter-nav="true"
                  value={item.currency}
                  onValueChange={(value) => onUpdateExpense(item.id, { currency: value })}
                />
              </PlannerFormField>

              <div className="flex items-end">
                {isLastLine ? (
                  <Button
                    aria-label="Add line below"
                    className="w-full md:w-full"
                    data-enter-nav="true"
                    onClick={() => onAddBelow(item.id)}
                  >
                    <PlusIcon data-icon="inline-start" />
                  </Button>
                ) : (
                  <Button
                    aria-label="Remove line"
                    variant="outline"
                    className="w-full md:w-full"
                    data-enter-nav="true"
                    disabled={!canRemove}
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2Icon data-icon="inline-start" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
