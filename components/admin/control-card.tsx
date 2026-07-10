import { cn } from "@/lib/utils";

export function ControlCard({
  icon: Icon,
  iconClassName,
  title,
  description,
  action,
  // Set only by cards whose `action` is a toggle (Switch) — clicking the
  // icon/title/description area then toggles it too, matching the old
  // <Label htmlFor> behavior where clicking the text (not just the tiny
  // switch pill) worked. Cards whose action is a Button must NOT set this:
  // it would double-fire (bubbling into the button's own onClick) and net
  // out to a no-op toggle-then-untoggle.
  onHeaderClick,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  onHeaderClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div
          className={cn("flex items-center gap-4", onHeaderClick && "cursor-pointer")}
          onClick={onHeaderClick}
        >
          <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", iconClassName)}>
            <Icon className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
