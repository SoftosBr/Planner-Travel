import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlannerResult } from "@/components/home/planner-result";

describe("PlannerResult", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the total fixed and only updates the converted amount", async () => {
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

    render(
      <PlannerResult
        open
        onOpenChange={() => {}}
        totalItems={4}
        totalsByCurrency={[
          ["USD", 20],
          ["BRL", 25],
        ]}
      />,
    );

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText("$25.00")).toBeInTheDocument();
    expect(within(dialog).getByText("R$125.00")).toBeInTheDocument();
    expect(within(dialog).getByText(/4 expense item\(s\) included/i)).toBeInTheDocument();
    expect(within(dialog).getByText("1.00 USD = 5.00 BRL")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /euro/i }));

    await waitFor(() => {
      expect(within(dialog).getByText("$25.00")).toBeInTheDocument();
      expect(within(dialog).getByText("€12.50")).toBeInTheDocument();
      expect(within(dialog).getByText("1.00 USD = 0.50 EUR")).toBeInTheDocument();
    });
  });

  it("preserves the original planner currency when there is a single source currency", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({
        amount: 1,
        base: "USD",
        date: "2026-03-13",
        rates: {
          BRL: 5.26,
          EUR: 0.5,
          JPY: 100,
          KRW: 1000,
        },
      }),
      ok: true,
      status: 200,
    } as Response);

    render(
      <PlannerResult
        open
        onOpenChange={() => {}}
        totalItems={1}
        totalsByCurrency={[["JPY", 25000]]}
      />,
    );

    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText("¥25,000.00")).toBeInTheDocument();
    expect(dialog).toHaveTextContent("1,250.00");
    expect(within(dialog).getByText("1.00 JPY = 0.05 BRL")).toBeInTheDocument();
  });
});
