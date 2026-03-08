import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Globe, Heart, Settings } from "lucide-react";
import { MiniPlayer } from "./MiniPlayer";
import { NowPlaying } from "./NowPlaying";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/contexts/PlayerContext";

const navItems = [
  { path: "/", icon: Home, label: "Listen" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/countries", icon: Globe, label: "Browse" },
  { path: "/favorites", icon: Heart, label: "Library" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentStation } = usePlayer();

  return (
    <div className="min-h-screen bg-background">
      <main className={cn("pb-20", currentStation && "pb-36")}>
        <Outlet />
      </main>

      <MiniPlayer />
      <NowPlaying />

      {/* Apple-style tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/50">
        <div className="flex items-center justify-around max-w-lg mx-auto py-2 pb-safe">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-col items-center gap-1 py-1 px-4 transition-all min-w-[60px]",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={24} strokeWidth={active ? 2.2 : 1.6} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
