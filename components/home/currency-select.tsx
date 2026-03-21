"use client";

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

type CurrencySelectProps = {
  className?: string;
  id?: string;
  placeholder?: string;
  value: Currency;
  onValueChange: (value: Currency) => void;
  ["data-enter-nav"]?: string;
};

export function CurrencySelect({
  className,
  id,
  placeholder = "Choose currency",
  value,
  onValueChange,
  "data-enter-nav": dataEnterNav,
}: CurrencySelectProps) {
  const selectedOption = currencyOptions.find((option) => option.value === value);

  return (
    <Select value={value} onValueChange={(nextValue) => onValueChange(nextValue as Currency)}>
      <SelectTrigger id={id} className={className} data-enter-nav={dataEnterNav}>
        <SelectValue placeholder={placeholder}>
          {selectedOption?.label}
        </SelectValue>
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
  );
}
