import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BudgetCard, type ExpenseItem } from "@/components/home/budget-card";

const twoExpenses: ExpenseItem[] = [
  { id: "1", category: "visa", value: "10", currency: "USD" },
  { id: "2", category: "others", value: "20", currency: "EUR" },
];

describe("BudgetCard", () => {
  it("shows one add action on the last line and remove on previous lines", async () => {
    const user = userEvent.setup();
    const onUpdateExpense = vi.fn();
    const onAddBelow = vi.fn();
    const onRemove = vi.fn();

    render(
      <BudgetCard
        expenses={twoExpenses}
        onUpdateExpense={onUpdateExpense}
        onAddBelow={onAddBelow}
        onRemove={onRemove}
      />,
    );

    expect(screen.getAllByRole("button", { name: /add line below/i })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: /remove line/i })).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: /add line below/i }));
    expect(onAddBelow).toHaveBeenCalledWith("2");

    await user.click(screen.getByRole("button", { name: /remove line/i }));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
