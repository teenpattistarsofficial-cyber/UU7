"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Camera, KeyRound } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaPicker, type MediaItem } from "@/components/admin/media-picker";
import { ControlCard } from "@/components/admin/control-card";
import { updateProfile, changeOwnPassword } from "@/lib/actions/profile";

export function ProfileSettings({
  initial,
}: {
  initial: { name: string; image: string | null };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [image, setImage] = useState(initial.image);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [savingProfile, startSavingProfile] = useTransition();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, startChangingPassword] = useTransition();

  const profileDirty = name.trim() !== initial.name || image !== initial.image;

  function handleSaveProfile() {
    if (!name.trim()) return;
    startSavingProfile(async () => {
      try {
        await updateProfile({ name: name.trim(), image });
        toast.success("Profile updated");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update profile");
      }
    });
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    startChangingPassword(async () => {
      try {
        await changeOwnPassword({ currentPassword, newPassword });
        toast.success("Password changed");
        setCurrentPassword("");
        setNewPassword("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to change password");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-border bg-muted/40 p-5">
        <div className="flex flex-wrap items-center gap-5">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="group relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand/25 to-brand/5 ring-1 ring-brand/20"
            title="Change photo"
          >
            {image ? (
              <Image src={image} alt={name} fill unoptimized className="object-cover" />
            ) : (
              <span className="font-heading text-xl font-semibold text-brand">{name.charAt(0).toUpperCase() || "?"}</span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-5 text-white" />
            </span>
          </button>

          <div className="min-w-[220px] flex-1 space-y-1.5">
            <Label htmlFor="profileName">Name</Label>
            <Input id="profileName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          <Button
            variant="brand"
            className="rounded-full px-5"
            disabled={!profileDirty || !name.trim() || savingProfile}
            onClick={handleSaveProfile}
          >
            {savingProfile ? "Saving…" : "Save"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Click your photo to upload a new one or choose from the media library.</p>
      </div>

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(item: MediaItem) => setImage(item.url)}
      />

      <ControlCard
        icon={KeyRound}
        iconClassName="bg-amber-500/10 text-amber-600"
        title="Password"
        description="Change the password used to sign in to this admin."
      >
        <form onSubmit={handleChangePassword} className="space-y-3 border-t border-border p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" variant="brand" className="rounded-full px-5" disabled={!currentPassword || !newPassword || changingPassword}>
            {changingPassword ? "Changing…" : "Change password"}
          </Button>
        </form>
      </ControlCard>
    </div>
  );
}
