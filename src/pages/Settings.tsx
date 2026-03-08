import { usePlayer } from "@/contexts/PlayerContext";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Moon, Sun, Monitor, Volume2, Wifi, Bell, Timer, Trash2, Info, Radio, SkipBack, SkipForward, Palette, Database, Shield } from "lucide-react";
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

  const skipOptions = [
    { value: 5, label: "5s" },
    { value: 10, label: "10s" },
    { value: 30, label: "30s" },
    { value: 60, label: "1m" },
  ];

  const clearFavorites = () => {
    localStorage.removeItem("radio-favorites");
    toast({ title: "Favorites cleared" });
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
        <p className="text-muted-foreground mt-1">Customize your radio experience</p>
      </div>

      {/* Appearance */}
      <Section title="Appearance" icon={<Palette size={16} />}>
        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground mb-3">Theme</p>
          <div className="flex gap-3">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => updateSettings({ theme: value })}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all",
                  settings.theme === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                <Icon size={24} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Playback */}
      <Section title="Playback" icon={<Volume2 size={16} />}>
        <div className="px-5">
          <div className="py-4 border-b border-border/40">
            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Wifi size={14} /> Stream Quality
            </p>
            <div className="flex gap-2">
              {qualityOptions.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => updateSettings({ streamQuality: value })}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all",
                    settings.streamQuality === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-[10px] opacity-70">{desc}</span>
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

      {/* Skip Controls */}
      <Section title="Skip Controls" icon={<SkipForward size={16} />}>
        <div className="px-5 py-4 space-y-5">
          <div>
            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <SkipBack size={14} /> Skip Backward
            </p>
            <div className="flex gap-2">
              {skipOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateSettings({ skipBackward: value })}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                    settings.skipBackward === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <SkipForward size={14} /> Skip Forward
            </p>
            <div className="flex gap-2">
              {skipOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateSettings({ skipForward: value })}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                    settings.skipForward === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            These settings control the skip buttons in the Now Playing view.
            For live radio, skip navigates between recent stations.
          </p>
        </div>
      </Section>

      {/* Sleep Timer */}
      <Section title="Sleep Timer" icon={<Timer size={16} />}>
        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground mb-3">Auto-stop after</p>
          <div className="flex gap-2 flex-wrap">
            {sleepOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateSettings({ sleepTimer: value })}
                className={cn(
                  "px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all",
                  settings.sleepTimer === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={<Bell size={16} />}>
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

      {/* Privacy */}
      <Section title="Privacy" icon={<Shield size={16} />}>
        <div className="px-5">
          <SettingRow
            icon={<Shield size={18} />}
            label="Location-based stations"
            description="Show stations from your country first"
          >
            <Switch
              checked={settings.locationEnabled}
              onCheckedChange={(v) => updateSettings({ locationEnabled: v })}
            />
          </SettingRow>
        </div>
      </Section>

      {/* Data & Storage */}
      <Section title="Data & Storage" icon={<Database size={16} />}>
        <div className="px-5">
          <button
            onClick={clearHistory}
            className="flex items-center gap-3 w-full py-4 border-b border-border/40 active:opacity-60 transition-opacity"
          >
            <Trash2 size={18} className="text-muted-foreground" />
            <div className="flex-1 text-left">
              <p className="text-[15px] text-foreground font-medium">Clear listening history</p>
              <p className="text-xs text-muted-foreground">{recentlyPlayed.length} stations</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/40" />
          </button>
          <button
            onClick={clearFavorites}
            className="flex items-center gap-3 w-full py-4 active:opacity-60 transition-opacity"
          >
            <Trash2 size={18} className="text-destructive" />
            <div className="flex-1 text-left">
              <p className="text-[15px] text-destructive font-medium">Clear all favorites</p>
              <p className="text-xs text-muted-foreground">{favorites.length} stations</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/40" />
          </button>
        </div>
      </Section>

      {/* About */}
      <Section title="About" icon={<Info size={16} />}>
        <div className="px-5">
          <div className="flex items-center gap-4 py-4 border-b border-border/40">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Radio size={28} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">World Radio</p>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
          <div className="py-4 border-b border-border/40">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Info size={14} /> Powered by Radio Browser API
            </p>
          </div>
          <div className="py-4 border-b border-border/40">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Stream 30,000+ radio stations from around the world. 
              Free and open source. Made with ❤️
            </p>
          </div>
          <div className="py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact</p>
            <a 
              href="mailto:social@pandeykapil.com.np" 
              className="text-sm text-primary font-medium hover:underline"
            >
              social@pandeykapil.com.np
            </a>
            <p className="text-xs text-muted-foreground mt-1">
              <a href="https://radio.pandeykapil.com.np" className="hover:underline" target="_blank" rel="noopener noreferrer">
                radio.pandeykapil.com.np
              </a>
            </p>
          </div>
        </div>
      </Section>

      <div className="h-10" />
    </div>
  );
};

const Section = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <section className="mt-8">
    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-5 mb-3 flex items-center gap-2">
      {icon}
      {title}
    </h2>
    <div className="bg-card mx-4 rounded-2xl overflow-hidden border border-border/50 shadow-sm">
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
  <div className="flex items-center gap-4 py-4 border-b border-border/40 last:border-b-0">
    <span className="text-muted-foreground">{icon}</span>
    <div className="flex-1">
      <p className="text-[15px] font-medium text-foreground">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    {children}
  </div>
);

export default Settings;
