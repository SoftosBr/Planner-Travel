import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/home/page";

describe("HomePage integration", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("adds a new expense line and calculates planner totals in the modal", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({
        amount: 1,
        base: "USD",
        date: "2026-03-13",
        rates: {
          BRL: 5,
          EUR: 0.5,
          JPY: 100,
          KRW: 1000,
        },
      }),
      ok: true,
      status: 200,
    } as Response);

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
    expect(valueInputs[0]).toHaveDisplayValue("10");
    expect(valueInputs[1]).toHaveDisplayValue("20");

    await user.click(screen.getByRole("button", { name: /finish planner and calculate/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/2 expense item\(s\) included/i)).toBeInTheDocument();
    expect(within(dialog).getByText("$30.00")).toBeInTheDocument();
    expect(within(dialog).getByText("R$150.00")).toBeInTheDocument();
    expect(within(dialog).getByText("Exchange rates from 2026-03-13")).toBeInTheDocument();
    expect(within(dialog).getByText("1.00 USD = 5.00 BRL")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /eur - euro/i }));

    await waitFor(() => {
      expect(within(dialog).getByText("$30.00")).toBeInTheDocument();
      expect(within(dialog).getByText("€15.00")).toBeInTheDocument();
      expect(within(dialog).getByText("Exchange rates from 2026-03-13")).toBeInTheDocument();
      expect(within(dialog).getByText("1.00 USD = 0.50 EUR")).toBeInTheDocument();
    });
  });
});
