"use client";

import type { ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FormSelect } from "@/components/admin/form-select";

/** A Select that filters by navigating — reads/writes a query param
 * directly instead of local component state. */
export function FilterSelect({
  paramName,
  options,
  defaultValue,
  icon,
}: {
  paramName: string;
  options: { value: string; label: string }[];
  defaultValue: string;
  icon?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(paramName) ?? defaultValue;

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === defaultValue) {
      params.delete(paramName);
    } else {
      params.set(paramName, next);
    }
    router.push(params.size ? `${pathname}?${params.toString()}` : pathname);
  }

  return <FormSelect value={value} onValueChange={handleChange} options={options} icon={icon} />;
}
