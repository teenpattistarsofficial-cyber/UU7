"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({ ...props }: AccordionPrimitive.Root.Props) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border/60 last:border-b-0", className)}
      {...props}
    />
  )
}

// `number` renders a small "01", "02"... column to the left of the
// question — the answer in AccordionPanel below reserves the same-width
// blank space so it aligns under the question text, not under the number.
// The `+`/`×` toggle isn't two swapped icons: it's one `Plus` rotated 45°
// on open (`group-data-[panel-open]:rotate-45`) — a plus rotated 45° reads
// as an ×. That rotation alone is a subtle change at 16px, easy to miss at
// a glance, so the circle's border/icon also switch to brand color on
// open (`group-data-[panel-open]:border-brand ...`) as a second, more
// obvious signal of which row is expanded.
function AccordionTrigger({
  className,
  children,
  number,
  ...props
}: AccordionPrimitive.Trigger.Props & { number?: number }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex flex-1 items-center gap-5 py-7 text-left outline-none transition-all focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {number != null && (
          <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground/60 tabular-nums">
            {String(number).padStart(2, "0")}
          </span>
        )}
        <span className="flex-1 font-heading text-base font-bold text-balance">{children}</span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-brand/40 group-hover:text-brand group-data-[panel-open]:border-brand group-data-[panel-open]:text-brand">
          <Plus className="size-4 rotate-0 transition-transform duration-200 group-data-[panel-open]:rotate-45" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionPanel({
  className,
  children,
  number,
  ...props
}: AccordionPrimitive.Panel.Props & { number?: number }) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-panel"
      className="h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0"
      {...props}
    >
      <div className={cn("flex gap-5 pb-7", className)}>
        {number != null && <span className="w-6 shrink-0" aria-hidden />}
        <div className="min-w-0 flex-1 pr-10 text-sm leading-relaxed sm:pr-16">{children}</div>
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionPanel }
