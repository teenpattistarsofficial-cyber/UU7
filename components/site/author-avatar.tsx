import Image from "next/image";
import { cn } from "@/lib/utils";

/** Shared avatar-with-initial-fallback, used by the article AuthorBox, the
 * author profile page, and the authors directory listing. Worth
 * centralizing specifically because every author in the current dataset
 * has no `avatarUrl` — the fallback circle is the common case in practice,
 * not a rare edge case, so it needs to look intentional on its own,
 * not just "acceptable until a real photo exists". */
export function AuthorAvatar({
  displayName,
  avatarUrl,
  size = "size-14",
  className,
}: {
  displayName: string;
  avatarUrl?: string | null;
  size?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-brand/25 to-brand/5 ring-1 ring-brand/20",
        size,
        className,
      )}
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt={displayName} fill unoptimized className="object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center font-heading font-semibold text-brand">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
