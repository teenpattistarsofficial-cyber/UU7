"use client";

import type { ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Base UI's Select (like Radix's) doesn't support an empty-string item
// value, so callers with an "unset" state must pass a non-empty sentinel
// (e.g. "none") as `value`/in `options` and translate it back to "" when
// reading the value out — this component intentionally does not do that
// translation itself since only the caller knows what "unset" means for it.
//
// `icon` takes a rendered element, not a component reference — a component
// reference can't cross the Server->Client Component boundary (only plain
// data and React elements can), and this component is used from both
// server pages (e.g. the date filter) and client tables.
export function FormSelect({
  value,
  onValueChange,
  placeholder,
  options,
  icon,
  triggerClassName,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: { value: string; label: string }[];
  icon?: ReactNode;
  triggerClassName?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(String(v))} items={options}>
      <SelectTrigger className={cn("w-full", triggerClassName)}>
        <span className="flex min-w-0 items-center gap-1.5">
          {icon}
          <SelectValue placeholder={placeholder} />
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
