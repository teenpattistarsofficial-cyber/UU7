import { Toaster } from "@/components/ui/sonner";

// Runs before hydration so a previously-chosen dark mode doesn't flash
// light on load. Scoped to #admin-root only — the public site never reads
// this class, so a dark-mode choice in the admin never leaks there.
const THEME_INIT_SCRIPT = `(function(){try{if(localStorage.getItem("admin-theme-mode")==="dark"){document.getElementById("admin-root").classList.add("dark")}}catch(e){}})();`;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="admin-root" suppressHydrationWarning className="admin-theme min-h-screen bg-background text-foreground">
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      {children}
      <Toaster position="top-right" />
    </div>
  );
}
