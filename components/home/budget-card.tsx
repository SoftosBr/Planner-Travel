"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export type ExpenseCategory = "visa" | "plane-ticket" | "accommodation" | "others";
export type Currency = "EUR" | "BRL" | "USD" | "JPY" | "KRW";

export type ExpenseItem = {
  id: string;
  category: ExpenseCategory;
  value: string;
  currency: Currency;
};

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

const currencyOptions: { value: Currency; label: string }[] = [
  { value: "EUR", label: "EUR - Euro" },
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "USD", label: "USD - American Dollar" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "KRW", label: "KRW - Korean Won" },
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

          return (
            <div
              key={item.id}
              className={
                index === 0
                  ? "grid gap-4 pb-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
                  : "grid gap-4 border-t border-border/70 py-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
              }
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor={`category-${item.id}`}>Category</Label>
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
                  data-enter-nav="true"
                  placeholder="0.00"
                  value={item.value}
                  onChange={(event) => onUpdateExpense(item.id, { value: event.target.value })}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={`currency-${item.id}`}>Currency</Label>
                <Select
                  value={item.currency}
                  onValueChange={(value) => onUpdateExpense(item.id, { currency: value as Currency })}
                >
                  <SelectTrigger
                    id={`currency-${item.id}`}
                    className="w-full"
                    data-enter-nav="true"
                  >
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
