"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export function PlannerResult({
  open,
  onOpenChange,
  totalItems,
  totalsByCurrency,
}: PlannerResultProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [exchangeSnapshot, setExchangeSnapshot] = useState(getExchangeRatesSnapshot);

  useEffect(() => subscribeToExchangeRates(() => setExchangeSnapshot(getExchangeRatesSnapshot())), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    void refreshExchangeRatesInBackground();
  }, [open]);

  const totalSpend = useMemo(
    () =>
      totalsByCurrency.reduce(
        (sum, [currency, total]) =>
          sum + convertCurrencyAmount(total, currency, selectedCurrency, exchangeSnapshot.rates),
        0,
      ),
    [exchangeSnapshot.rates, selectedCurrency, totalsByCurrency],
  );

  const selectedExchangeValue = useMemo(() => {
    if (selectedCurrency === exchangeSnapshot.searchedBase) {
      return exchangeSnapshot.searchedAmount;
    }

    return exchangeSnapshot.searchedAmount === null
      ? null
      : exchangeSnapshot.searchedAmount * exchangeSnapshot.rates[selectedCurrency];
  }, [
    exchangeSnapshot.rates,
    exchangeSnapshot.searchedAmount,
    exchangeSnapshot.searchedBase,
    selectedCurrency,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Planner result</DialogTitle>
          <DialogDescription>{totalItems} expense item(s) included in the total.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="planner-total-spend">Total spend</Label>
            <Input
              id="planner-total-spend"
              readOnly
              value={`${selectedCurrency} ${totalSpend.toFixed(2)}`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="planner-total-currency">Display currency</Label>
            <Select value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value as Currency)}>
              <SelectTrigger id="planner-total-currency" className="w-full">
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
        </div>

        <div className="flex flex-col gap-3">
          {totalsByCurrency.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No valid values to calculate yet. Enter a value greater than zero.
            </p>
          ) : (
            totalsByCurrency.map(([currency, total]) => (
              <div
                key={currency}
                className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2"
              >
                <span className="text-sm text-muted-foreground">{currency}</span>
                <span className="text-base font-semibold">{total.toFixed(2)}</span>
              </div>
            ))
          )}
        </div>

        <p className="text-sm text-muted-foreground" role="status">
          {exchangeSnapshot.isLoading
            ? "Refreshing exchange rates in background."
            : exchangeSnapshot.searchedDate && selectedExchangeValue !== null
              ? `Exchange rates from ${exchangeSnapshot.searchedDate}. ${exchangeSnapshot.searchedAmount?.toFixed(2)} ${exchangeSnapshot.searchedBase} = ${selectedExchangeValue.toFixed(2)} ${selectedCurrency}.`
              : exchangeSnapshot.fetchedAt
                ? "Exchange rates are ready."
              : "Using saved exchange rates until the live refresh finishes."}
        </p>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
