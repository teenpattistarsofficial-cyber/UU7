export function SettingsSectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <Icon className="size-6" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 max-w-xl text-base text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
