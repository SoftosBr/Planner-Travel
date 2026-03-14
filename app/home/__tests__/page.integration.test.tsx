import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/home/page";

describe("HomePage integration", () => {
  it("adds a new expense line and calculates planner totals", async () => {
    const user = userEvent.setup();

    render(<HomePage />);

    const budgetCardTitle = screen.getByText(/budget lines/i);
    const budgetCard = budgetCardTitle.closest("div[data-slot='card']") ?? budgetCardTitle.parentElement;
    if (!budgetCard) {
      throw new Error("Budget card container not found");
    }

    expect(screen.getAllByLabelText(/budgeted value/i)).toHaveLength(1);

    await user.click(within(budgetCard).getByRole("button", { name: /add line below/i }));

    const valueInputs = screen.getAllByLabelText(/budgeted value/i);
    expect(valueInputs).toHaveLength(2);

    await user.type(valueInputs[0], "10");
    await user.type(valueInputs[1], "20");

    await user.click(screen.getByRole("button", { name: /finish planner and calculate/i }));

    expect(screen.getByText(/2 expense item\(s\) included/i)).toBeInTheDocument();
    const resultTitle = screen.getByText(/planner result/i);
    const resultCard = resultTitle.closest("div[data-slot='card']") ?? resultTitle.parentElement;
    if (!resultCard) {
      throw new Error("Result card container not found");
    }

    expect(within(resultCard).getByText("USD")).toBeInTheDocument();
    expect(within(resultCard).getByText("30.00")).toBeInTheDocument();
  });
});
