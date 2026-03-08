import { usePlayer } from "@/contexts/PlayerContext";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Moon, Sun, Monitor, Volume2, Wifi, Bell, Timer, Trash2, Info, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const { settings, updateSettings, favorites, recentlyPlayed } = usePlayer();

  const themeOptions = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "system" as const, label: "Auto", icon: Monitor },
  ];

  const qualityOptions = [
    { value: "low" as const, label: "Low", desc: "Saves data" },
    { value: "medium" as const, label: "Medium", desc: "Balanced" },
    { value: "high" as const, label: "High", desc: "Best quality" },
  ];

  const sleepOptions = [
    { value: 0, label: "Off" },
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
  ];

  const clearFavorites = () => {
    localStorage.removeItem("radio-favorites");
    window.location.reload();
  };

  const clearHistory = () => {
    localStorage.removeItem("radio-recent");
    toast({ title: "History cleared" });
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <div className="px-5 py-3">
          <p className="text-[13px] text-muted-foreground mb-3">Theme</p>
          <div className="flex gap-2">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => updateSettings({ theme: value })}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all",
                  settings.theme === value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Playback */}
      <Section title="Playback">
        <div className="px-5">
          <div className="py-3 border-b border-border/40">
            <p className="text-[13px] text-muted-foreground mb-3 flex items-center gap-2">
              <Wifi size={14} /> Stream Quality
            </p>
            <div className="flex gap-2">
              {qualityOptions.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => updateSettings({ streamQuality: value })}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl border transition-all",
                    settings.streamQuality === value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  <span className="text-xs font-medium">{label}</span>
                  <span className="text-[10px] opacity-60">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          <SettingRow
            icon={<Volume2 size={18} />}
            label="Auto-play"
            description="Play station when selected"
          >
            <Switch
              checked={settings.autoPlay}
              onCheckedChange={(v) => updateSettings({ autoPlay: v })}
            />
          </SettingRow>
        </div>
      </Section>

      {/* Sleep Timer */}
      <Section title="Sleep Timer">
        <div className="px-5 py-3">
          <p className="text-[13px] text-muted-foreground mb-3 flex items-center gap-2">
            <Timer size={14} /> Auto-stop after
          </p>
          <div className="flex gap-2 flex-wrap">
            {sleepOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateSettings({ sleepTimer: value })}
                className={cn(
                  "px-4 py-2 rounded-full border text-sm transition-all",
                  settings.sleepTimer === value
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-border text-muted-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <div className="px-5">
          <SettingRow
            icon={<Bell size={18} />}
            label="Show notifications"
            description="Station change alerts"
          >
            <Switch
              checked={settings.showNotifications}
              onCheckedChange={(v) => updateSettings({ showNotifications: v })}
            />
          </SettingRow>
        </div>
      </Section>

      {/* Data */}
      <Section title="Data & Storage">
        <div className="px-5">
          <button
            onClick={clearHistory}
            className="flex items-center gap-3 w-full py-3.5 border-b border-border/40 active:opacity-60 transition-opacity"
          >
            <Trash2 size={18} className="text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="text-[15px] text-foreground">Clear listening history</p>
              <p className="text-xs text-muted-foreground">{recentlyPlayed.length} stations</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/40" />
          </button>
          <button
            onClick={clearFavorites}
            className="flex items-center gap-3 w-full py-3.5 active:opacity-60 transition-opacity"
          >
            <Trash2 size={18} className="text-destructive" />
            <div className="flex-1 text-left">
              <p className="text-[15px] text-destructive">Clear all favorites</p>
              <p className="text-xs text-muted-foreground">{favorites.length} stations</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/40" />
          </button>
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <div className="px-5">
          <div className="flex items-center gap-3 py-3.5 border-b border-border/40">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Radio size={20} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-[15px] font-medium text-foreground">World Radio</p>
              <p className="text-xs text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
          <div className="py-3.5 border-b border-border/40">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Info size={12} /> Powered by Radio Browser API
            </p>
          </div>
          <div className="py-3.5">
            <p className="text-xs text-muted-foreground">
              Stream 30,000+ radio stations from around the world. Free and open source.
            </p>
          </div>
        </div>
      </Section>

      <div className="h-8" />
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-6">
    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-5 mb-2">{title}</h2>
    <div className="bg-card mx-4 rounded-xl overflow-hidden">
      {children}
    </div>
  </section>
);

const SettingRow = ({ icon, label, description, children }: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-3 py-3.5 border-b border-border/40 last:border-b-0">
    <span className="text-muted-foreground">{icon}</span>
    <div className="flex-1">
      <p className="text-[15px] text-foreground">{label}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
    {children}
  </div>
);

export default Settings;
