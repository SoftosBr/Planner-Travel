"use client";

import { useEffect, useMemo, useState } from "react";
import { XIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currencyOptions, type Currency } from "@/lib/currencies";
import {
  convertCurrencyAmount,
  getExchangeRatesSnapshot,
  refreshExchangeRatesInBackground,
  subscribeToExchangeRates,
} from "@/lib/exchange-rates";

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
        className="overflow-hidden border border-white/12 p-0 text-white shadow-2xl ring-1 ring-black/60 sm:max-w-2xl"
      >
        <div className="absolute inset-0 opacity-70" />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative flex flex-col gap-8 p-6 sm:p-8">
          <DialogHeader className="gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="w-fit rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[0.7rem] font-semibold tracking-[0.24em] uppercase text-white/60">
                  Financial summary
                </span>
                <DialogTitle className="font-[var(--font-display)] text-3xl tracking-tight text-white sm:text-4xl">
                  Planner result
                </DialogTitle>
              </div>

              <DialogClose
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  />
                }
              >
                <XIcon />
                <span className="sr-only">Close</span>
              </DialogClose>
            </div>

            <DialogDescription className="max-w-xl text-sm leading-6 text-white/58">
              Review the fixed planner total and convert it with the latest exchange rates.
            </DialogDescription>
          </DialogHeader>

          <section className="flex flex-col gap-4">
            <span className="text-xs font-semibold tracking-[0.24em] uppercase text-white/45">
              Total spend
            </span>

            <div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur-sm sm:p-6">
              <p className="font-[var(--font-display)] text-4xl leading-none tracking-tight text-white sm:text-6xl">
                {totalSpendLabel}
              </p>
              <p className="mt-3 text-sm text-white/55">
                {totalItems} expense item(s) included
              </p>
            </div>

            {!hasTotals ? (
              <p className="rounded-2xl border border-dashed border-white/12 bg-white/4 px-4 py-3 text-sm text-white/55">
                No valid values to calculate yet. Enter a value greater than zero.
              </p>
            ) : null}
          </section>

          <section className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-black/20 p-5 backdrop-blur-sm sm:p-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="planner-total-currency"
                className="text-xs font-semibold tracking-[0.24em] uppercase text-white/45"
              >
                Convert to:
              </label>
              <Select
                value={selectedCurrency}
                onValueChange={(value) => setSelectedCurrency(value as Currency)}
              >
                <SelectTrigger
                  id="planner-total-currency"
                  className="w-full border-white/12 bg-white/7 px-4 py-3 text-base text-white hover:bg-white/10 data-placeholder:text-white/45"
                >
                  <SelectValue placeholder="Choose currency" />
                </SelectTrigger>
                <SelectContent className="border border-white/12 bg-[#121215] text-white">
                  <SelectGroup>
                    <SelectLabel className="text-white/45">Currencies</SelectLabel>
                    {currencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-6 rounded-[1.5rem] bg-white/6 border border-white/18 p-5">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-amber-50/72">≈ Equates to</span>
                <p className="font-[var(--font-display)] text-3xl tracking-tight text-amber-50 sm:text-4xl">
                  {convertedAmountLabel}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/62">
                {exchangeSnapshot.searchedDate ? (
                  <div className="flex flex-col gap-1">
                    <span>Exchange rates from {exchangeSnapshot.searchedDate}</span>
                    {exchangeRateLabel ? <span>{exchangeRateLabel}</span> : null}
                  </div>
                ) : (
                  <span>{statusLabel}</span>
                )}
              </div>
            </div>
          </section>

          <DialogFooter className="mx-0 mb-0 rounded-[1.5rem] border border-white/10 bg-white/5 p-3 sm:justify-end">
            <p className="mr-auto self-center px-2 text-xs tracking-[0.18em] uppercase text-white/40">
              {statusLabel}
            </p>
            <DialogClose
              render={
                <Button
                  className="rounded-full bg-white px-5 text-black hover:bg-white/90"
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
