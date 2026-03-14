"use client";

import { useMemo, useState } from "react";
import type { ExpenseItem } from "@/components/home/budget-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const SHARE_PARAM = "plan";

type SharePlannerProps = {
  expenses: ExpenseItem[];
};

export function SharePlanner({ expenses }: SharePlannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const url = new URL(window.location.href);
    const sharePayload = expenses.map(({ category, value, currency }) => ({
      category,
      value,
      currency,
    }));

    url.searchParams.set(SHARE_PARAM, encodeURIComponent(JSON.stringify(sharePayload)));
    return url.toString();
  }, [expenses]);

  async function copyShareUrl() {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
        data-enter-nav="true"
        onClick={() => setIsOpen(true)}
      >
        Share planner
      </Button>

      <Dialog
        open={isOpen}
        onOpenChange={(nextOpen) => {
          setIsOpen(nextOpen);
          if (!nextOpen) {
            setCopied(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share planner URL</DialogTitle>
            <DialogDescription>
              This link contains your budget lines and will pre-fill the form.
            </DialogDescription>
          </DialogHeader>

          <Input value={shareUrl} readOnly />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button onClick={copyShareUrl}>{copied ? "Copied" : "Copy URL"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
