"use client";

import { useEffect, useMemo, useState } from "react";
import { XIcon } from "lucide-react";
import { CurrencySelect } from "@/components/home/currency-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Currency } from "@/lib/currencies";
import {
  convertCurrencyAmount,
  getExchangeRatesSnapshot,
  refreshExchangeRatesInBackground,
  subscribeToExchangeRates,
} from "@/lib/exchange-rates";
import { cn } from "@/lib/utils";

type PlannerResultProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  totalItems: number;
  totalsByCurrency: [Currency, number][];
};

function formatCurrency(amount: number, currency: Currency) {
  try {
    return new Intl.NumberFormat("en-US", {
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: "currency",
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

type ResultPanelProps = {
  children: React.ReactNode;
  className?: string;
};

function ResultPanel({ children, className }: ResultPanelProps) {
  return (
    <div className={cn("rounded-[2rem] border border-border bg-card p-5 backdrop-blur-sm sm:p-6", className)}>
      {children}
    </div>
  );
}

function ResultSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold tracking-[0.24em] uppercase text-muted-foreground">
      {children}
    </span>
  );
}

function ResultHeader() {
  return (
    <DialogHeader className="gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="w-fit rounded-full border border-border bg-card px-3 py-1 text-[0.7rem] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
            Financial summary
          </span>
          <DialogTitle className="font-[var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
            Planner result
          </DialogTitle>
        </div>

        <DialogClose
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full border border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            />
          }
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogClose>
      </div>

      <DialogDescription className="max-w-xl text-sm leading-6 text-muted-foreground">
        Review the fixed planner total and convert it with the latest exchange rates.
      </DialogDescription>
    </DialogHeader>
  );
}

function ExchangeRateStatus({
  exchangeRateLabel,
  exchangeRateDate,
  statusLabel,
}: {
  exchangeRateDate: string | null;
  exchangeRateLabel: string | null;
  statusLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
      {exchangeRateDate ? (
        <div className="flex flex-col gap-1">
          <span>Exchange rates from {exchangeRateDate}</span>
          {exchangeRateLabel ? <span>{exchangeRateLabel}</span> : null}
        </div>
      ) : (
        <span>{statusLabel}</span>
      )}
    </div>
  );
}

export function PlannerResult({
  open,
  onOpenChange,
  totalItems,
  totalsByCurrency,
}: PlannerResultProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("BRL");
  const [exchangeSnapshot, setExchangeSnapshot] = useState(getExchangeRatesSnapshot);

  useEffect(() => subscribeToExchangeRates(() => setExchangeSnapshot(getExchangeRatesSnapshot())), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    void refreshExchangeRatesInBackground();
  }, [open]);

  const sourceCurrency = exchangeSnapshot.searchedBase;

  const totalSpend = useMemo(
    () =>
      totalsByCurrency.reduce(
        (sum, [currency, total]) =>
          sum + convertCurrencyAmount(total, currency, sourceCurrency, exchangeSnapshot.rates),
        0,
      ),
    [exchangeSnapshot.rates, sourceCurrency, totalsByCurrency],
  );

  const convertedAmount = useMemo(
    () =>
      convertCurrencyAmount(totalSpend, sourceCurrency, selectedCurrency, exchangeSnapshot.rates),
    [exchangeSnapshot.rates, selectedCurrency, sourceCurrency, totalSpend],
  );

  const selectedExchangeValue = useMemo(() => {
    if (selectedCurrency === sourceCurrency) {
      return exchangeSnapshot.searchedAmount;
    }

    if (exchangeSnapshot.searchedAmount === null) {
      return null;
    }

    return exchangeSnapshot.searchedAmount * exchangeSnapshot.rates[selectedCurrency];
  }, [
    exchangeSnapshot.rates,
    exchangeSnapshot.searchedAmount,
    selectedCurrency,
    sourceCurrency,
  ]);

  const totalSpendLabel = useMemo(
    () => formatCurrency(totalSpend, sourceCurrency),
    [sourceCurrency, totalSpend],
  );

  const convertedAmountLabel = useMemo(
    () => formatCurrency(convertedAmount, selectedCurrency),
    [convertedAmount, selectedCurrency],
  );

  const exchangeRateLabel = useMemo(() => {
    if (selectedExchangeValue === null) {
      return null;
    }

    return `${exchangeSnapshot.searchedAmount?.toFixed(2)} ${sourceCurrency} = ${selectedExchangeValue.toFixed(2)} ${selectedCurrency}`;
  }, [exchangeSnapshot.searchedAmount, selectedCurrency, selectedExchangeValue, sourceCurrency]);

  const statusLabel = useMemo(() => {
    if (exchangeSnapshot.error) {
      return exchangeSnapshot.error;
    }

    if (exchangeSnapshot.isLoading) {
      return "Refreshing exchange rates in background.";
    }

    if (exchangeSnapshot.fetchedAt) {
      return "Live exchange rates applied.";
    }

    return "Using saved exchange rates until the live refresh finishes.";
  }, [exchangeSnapshot.error, exchangeSnapshot.fetchedAt, exchangeSnapshot.isLoading]);

  const hasTotals = totalsByCurrency.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden border border-border bg-background p-0 text-foreground shadow-2xl ring-1 ring-border sm:max-w-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-muted opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-accent/30" />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative flex flex-col gap-8 p-6 sm:p-8">
          <ResultHeader />

          <section className="flex flex-col gap-4">
            <ResultSectionLabel>Total spend</ResultSectionLabel>

            <ResultPanel className="shadow-sm">
              <p className="font-[var(--font-display)] text-4xl leading-none tracking-tight text-foreground sm:text-6xl">
                {totalSpendLabel}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {totalItems} expense item(s) included
              </p>
            </ResultPanel>

            {!hasTotals ? (
              <p className="rounded-2xl border border-dashed border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                No valid values to calculate yet. Enter a value greater than zero.
              </p>
            ) : null}
          </section>

          <ResultPanel className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="planner-total-currency"
                className="text-xs font-semibold tracking-[0.24em] uppercase text-muted-foreground"
              >
                Convert to:
              </label>
              <CurrencySelect
                id="planner-total-currency"
                className="w-full border-border bg-background px-4 py-3 text-base text-foreground hover:bg-muted data-placeholder:text-muted-foreground"
                value={selectedCurrency}
                onValueChange={setSelectedCurrency}
              />
            </div>

            <div className="flex flex-col gap-6 rounded-[1.5rem] border border-border bg-muted p-5">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">≈ Equates to</span>
                <p className="font-[var(--font-display)] text-3xl tracking-tight text-foreground sm:text-4xl">
                  {convertedAmountLabel}
                </p>
              </div>

              <ExchangeRateStatus
                exchangeRateDate={exchangeSnapshot.searchedDate}
                exchangeRateLabel={exchangeRateLabel}
                statusLabel={statusLabel}
              />
            </div>
          </ResultPanel>

          <DialogFooter className="mx-0 mb-0 rounded-[1.5rem] border border-border bg-muted p-3 sm:justify-end">
            <p className="mr-auto self-center px-2 text-xs tracking-[0.18em] uppercase text-muted-foreground">
              {statusLabel}
            </p>
            <DialogClose
              render={
                <Button
                  className="rounded-full px-5"
                  size="lg"
                />
              }
            >
              Close
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
