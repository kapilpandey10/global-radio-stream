import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Globe, Heart } from "lucide-react";
import { MiniPlayer } from "./MiniPlayer";
import { NowPlaying } from "./NowPlaying";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Discover" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/countries", icon: Globe, label: "Countries" },
  { path: "/favorites", icon: Heart, label: "Favorites" },
];

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-36 md:pb-24">
        <Outlet />
      </main>

      <MiniPlayer />
      <NowPlaying />

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-border/50">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 px-4 transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={20} className={active ? "text-primary" : ""} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
