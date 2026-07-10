import { FileText, MessageSquare, Image as ImageIcon, Users, HelpCircle, ArrowRightLeft, MousePointerClick, Phone } from "lucide-react";
import { StatTile } from "@/components/admin/dashboard/stat-tile";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export function ContentOverviewSection({
  totalPosts,
  publishedPosts,
  draftPosts,
  pendingComments,
  mediaCount,
  mediaSizeBytes,
  userCount,
  faqCount,
  redirectCount,
  ctaCount,
  contactChannelCount,
}: {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  pendingComments: number;
  mediaCount: number;
  mediaSizeBytes: number;
  userCount: number;
  faqCount: number;
  redirectCount: number;
  ctaCount: number;
  contactChannelCount: number;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={FileText}
          color="indigo"
          value={totalPosts}
          label="Total Articles"
          caption={`${publishedPosts} published · ${draftPosts} drafts`}
          accentBorder
        />
        <StatTile
          icon={MessageSquare}
          color="emerald"
          value={pendingComments}
          label="Pending Comments"
          caption={pendingComments > 0 ? "Awaiting moderation" : "All caught up"}
          accentBorder
        />
        <StatTile icon={ImageIcon} color="violet" value={mediaCount} label="Media Assets" caption={`${formatBytes(mediaSizeBytes)} stored`} accentBorder />
        <StatTile icon={Users} color="amber" value={userCount} label="Active Users" caption={`${userCount} total accounts`} accentBorder />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={HelpCircle} color="blue" value={faqCount} label="FAQ Entries" caption="Active FAQ items" />
        <StatTile icon={ArrowRightLeft} color="brand" value={redirectCount} label="Redirects" caption="Active redirects" />
        <StatTile icon={MousePointerClick} color="emerald" value={ctaCount} label="CTA Blocks" caption="Across all posts" />
        <StatTile icon={Phone} color="violet" value={contactChannelCount} label="Contact Channels" caption="Active channels" />
      </div>
    </div>
  );
}
