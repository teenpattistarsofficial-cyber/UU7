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
  sizes = "56px",
  className,
}: {
  displayName: string;
  avatarUrl?: string | null;
  size?: string;
  /** next/image `sizes` attribute — must match this avatar's actual rendered
   * pixel size (the `size` prop is only a Tailwind class string, not a
   * number `fill` can read), or the optimizer picks the wrong srcset
   * candidate. */
  sizes?: string;
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
        <Image src={avatarUrl} alt={displayName} fill sizes={sizes} className="object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center font-heading font-semibold text-brand">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
