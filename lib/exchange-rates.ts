"use client";

import { currencyOptions, type Currency } from "@/lib/currencies";

export type ExchangeRates = Record<Currency, number>;

type ExchangeRatesSnapshot = {
  error: string | null;
  fetchedAt: number | null;
  isLoading: boolean;
  rates: ExchangeRates;
  searchedAmount: number | null;
  searchedBase: Currency;
  searchedDate: string | null;
};

type ExchangeRatesResponse = {
  amount?: number;
  base?: string;
  date?: string;
  rates?: Partial<Record<Currency, number>>;
};

const CACHE_TTL_MS = 60 * 60 * 1000;
const BASE_CURRENCY: Currency = "USD";
const FALLBACK_RATES: ExchangeRates = {
  BRL: 5,
  EUR: 0.92,
  JPY: 150,
  KRW: 1000,
  USD: 1,
};
const REQUESTED_CURRENCIES = currencyOptions
  .map((option) => option.value)
  .filter((currency) => currency !== BASE_CURRENCY)
  .join(",");

let snapshot: ExchangeRatesSnapshot = {
  error: null,
  fetchedAt: null,
  isLoading: false,
  rates: FALLBACK_RATES,
  searchedAmount: null,
  searchedBase: BASE_CURRENCY,
  searchedDate: null,
};
let pendingRequest: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emitSnapshot() {
  for (const listener of listeners) {
    listener();
  }
}

function shouldRefresh() {
  if (snapshot.fetchedAt === null) {
    return true;
  }

  return Date.now() - snapshot.fetchedAt >= CACHE_TTL_MS;
}

async function fetchLatestRates() {
  const response = await fetch(
    `https://api.frankfurter.app/latest?from=${BASE_CURRENCY}&to=${REQUESTED_CURRENCIES}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Rate lookup failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ExchangeRatesResponse;
  const nextRates: ExchangeRates = {
    ...FALLBACK_RATES,
    ...payload.rates,
    USD: 1,
  };

  snapshot = {
    error: null,
    fetchedAt: Date.now(),
    isLoading: false,
    rates: nextRates,
    searchedAmount: typeof payload.amount === "number" ? payload.amount : 1,
    searchedBase: BASE_CURRENCY,
    searchedDate: payload.date ?? null,
  };
}

export function getExchangeRatesSnapshot() {
  return snapshot;
}

export function subscribeToExchangeRates(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function refreshExchangeRatesInBackground(force = false) {
  if (!force && !shouldRefresh()) {
    return pendingRequest ?? Promise.resolve();
  }

  if (pendingRequest) {
    return pendingRequest;
  }

  snapshot = {
    ...snapshot,
    error: null,
    isLoading: true,
  };
  emitSnapshot();

  pendingRequest = fetchLatestRates()
    .catch((error: unknown) => {
      snapshot = {
        ...snapshot,
        error: error instanceof Error ? error.message : "Unable to refresh exchange rates.",
        isLoading: false,
      };
    })
    .finally(() => {
      pendingRequest = null;
      emitSnapshot();
    });

  return pendingRequest;
}

export function convertCurrencyAmount(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: ExchangeRates,
) {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  if (fromCurrency === toCurrency) {
    return amount;
  }

  const sourceRate = rates[fromCurrency];
  const targetRate = rates[toCurrency];

  if (!sourceRate || !targetRate) {
    return amount;
  }

  const amountInUsd = fromCurrency === BASE_CURRENCY ? amount : amount / sourceRate;
  return toCurrency === BASE_CURRENCY ? amountInUsd : amountInUsd * targetRate;
}
