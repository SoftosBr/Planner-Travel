import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PlannerFormFieldProps = {
  children: ReactNode;
  className?: string;
  htmlFor: string;
  label: string;
};

export function PlannerFormField({
  children,
  className,
  htmlFor,
  label,
}: PlannerFormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
