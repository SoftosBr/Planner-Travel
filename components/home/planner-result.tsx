import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Currency } from "@/components/home/budget-card";

type PlannerResultProps = {
  totalItems: number;
  totalsByCurrency: [Currency, number][];
};

export function PlannerResult({ totalItems, totalsByCurrency }: PlannerResultProps) {
  return (
    <Card className="border-border/70 bg-card/95">
      <CardHeader>
        <CardTitle>Planner result</CardTitle>
        <CardDescription>{totalItems} expense item(s) included in the total.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {totalsByCurrency.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No valid values to calculate yet. Enter a value greater than zero.
          </p>
        ) : (
          totalsByCurrency.map(([currency, total]) => (
            <div
              key={currency}
              className="flex items-center justify-between rounded-lg border border-border/70 bg-background px-3 py-2"
            >
              <span className="text-sm text-muted-foreground">{currency}</span>
              <span className="text-base font-semibold">{total.toFixed(2)}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
