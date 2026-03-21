import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type LayoutContainerProps = {
  children: ReactNode;
  className?: string;
};

export function LayoutContainer({ children, className }: LayoutContainerProps) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}
