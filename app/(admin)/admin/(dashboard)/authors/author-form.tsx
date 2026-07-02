import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AuthorDefaults = {
  displayName?: string;
  slug?: string;
  bio?: string | null;
  roleTitle?: string | null;
  avatarUrl?: string | null;
  expertiseTags?: string[] | null;
  socialLinks?: Record<string, string> | null;
};

export function AuthorForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  defaultValues?: AuthorDefaults;
}) {
  return (
    <form action={action} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" name="displayName" required defaultValue={defaultValues?.displayName} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" placeholder="auto-generated if left blank" defaultValue={defaultValues?.slug} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="roleTitle">Role / title</Label>
        <Input id="roleTitle" name="roleTitle" placeholder="e.g. Senior Betting Analyst" defaultValue={defaultValues?.roleTitle ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={4} defaultValue={defaultValues?.bio ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expertiseTags">Expertise (comma separated)</Label>
        <Input
          id="expertiseTags"
          name="expertiseTags"
          placeholder="sports betting, slots, responsible gambling"
          defaultValue={defaultValues?.expertiseTags?.join(", ") ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input id="avatarUrl" name="avatarUrl" defaultValue={defaultValues?.avatarUrl ?? ""} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter</Label>
          <Input id="twitter" name="twitter" defaultValue={defaultValues?.socialLinks?.twitter ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input id="linkedin" name="linkedin" defaultValue={defaultValues?.socialLinks?.linkedin ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" defaultValue={defaultValues?.socialLinks?.website ?? ""} />
        </div>
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
