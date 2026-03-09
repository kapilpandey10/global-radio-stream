import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { makeStation, saveUserCustomStation } from "@/data/customStations";
import { toast } from "sonner";

interface AddStationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: () => void;
}

export const AddStationDialog = ({ open, onOpenChange, onAdded }: AddStationDialogProps) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [favicon, setFavicon] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    
    if (!trimmedName || trimmedName.length > 100) {
      toast.error("Station name is required (max 100 chars)");
      return;
    }
    
    if (!trimmedUrl || !/^https?:\/\/.+/.test(trimmedUrl)) {
      toast.error("Please enter a valid stream URL (http/https)");
      return;
    }

    if (trimmedUrl.length > 500) {
      toast.error("URL is too long");
      return;
    }

    setSaving(true);
    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const station = makeStation(
      id,
      trimmedName,
      trimmedUrl,
      country.trim() || "Custom",
      countryCode.trim().toUpperCase().slice(0, 2) || "",
      favicon.trim(),
      "custom",
    );

    saveUserCustomStation(station);
    toast.success(`"${trimmedName}" added!`);
    setName(""); setUrl(""); setCountry(""); setCountryCode(""); setFavicon("");
    setSaving(false);
    onAdded?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Add Custom Station</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter a stream URL to add your own radio station.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="station-name" className="text-xs font-semibold">Station Name *</Label>
            <Input id="station-name" value={name} onChange={e => setName(e.target.value)} placeholder="My Radio" maxLength={100} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="station-url" className="text-xs font-semibold">Stream URL *</Label>
            <Input id="station-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://stream.example.com/live" maxLength={500} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="station-country" className="text-xs font-semibold">Country</Label>
              <Input id="station-country" value={country} onChange={e => setCountry(e.target.value)} placeholder="Nepal" maxLength={50} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="station-cc" className="text-xs font-semibold">Country Code</Label>
              <Input id="station-cc" value={countryCode} onChange={e => setCountryCode(e.target.value)} placeholder="NP" maxLength={2} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="station-logo" className="text-xs font-semibold">Logo URL (optional)</Label>
            <Input id="station-logo" value={favicon} onChange={e => setFavicon(e.target.value)} placeholder="https://example.com/logo.png" maxLength={500} />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Adding..." : "Add Station"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
