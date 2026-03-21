"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import type { ExpenseItem } from "@/components/home/budget-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const SHARE_PARAM = "plan";

type SharePlannerProps = {
  expenses: ExpenseItem[];
};

function subscribeToLocation() {
  return () => {};
}

export function SharePlanner({ expenses }: SharePlannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const currentUrl = useSyncExternalStore(
    subscribeToLocation,
    () => window.location.href,
    () => "",
  );

  const shareUrl = useMemo(() => {
    if (!currentUrl) {
      return "";
    }

    const url = new URL(currentUrl);
    const sharePayload = expenses.map(({ category, value, currency }) => ({
      category,
      value,
      currency,
    }));

    url.searchParams.set(SHARE_PARAM, encodeURIComponent(JSON.stringify(sharePayload)));
    return url.toString();
  }, [currentUrl, expenses]);

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

          <div className="flex items-center gap-2">
            <Input className="flex-1" value={shareUrl} readOnly />
            <Button
              size="icon"
              variant="outline"
              aria-label={copied ? "URL copied" : "Copy share URL"}
              onClick={copyShareUrl}
            >
              {copied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
