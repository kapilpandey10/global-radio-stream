import { RadioStation } from "@/types/radio";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StationLogo } from "./StationLogo";
import { ExternalLink, Globe, MapPin, Languages, Radio, BarChart3, Tag } from "lucide-react";

interface StationInfoDialogProps {
  station: RadioStation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StationInfoDialog = ({ station, open, onOpenChange }: StationInfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <StationLogo
              src={station.favicon}
              name={station.name}
              size="sm"
              className="rounded-xl"
            />
            <span className="truncate text-lg">{station.name}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <InfoRow icon={<Globe size={15} />} label="Country" value={station.country} />
          {station.state && <InfoRow icon={<MapPin size={15} />} label="State" value={station.state} />}
          {station.language && <InfoRow icon={<Languages size={15} />} label="Language" value={station.language} />}
          {station.codec && <InfoRow icon={<Radio size={15} />} label="Codec" value={station.codec} />}
          {station.bitrate > 0 && <InfoRow icon={<BarChart3 size={15} />} label="Bitrate" value={`${station.bitrate} kbps`} />}
          {station.tags && <InfoRow icon={<Tag size={15} />} label="Tags" value={station.tags.split(",").slice(0, 5).join(", ")} />}
          {station.votes > 0 && <InfoRow icon={<BarChart3 size={15} />} label="Votes" value={station.votes.toLocaleString()} />}
          {station.homepage && (
            <a 
              href={station.homepage} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 mt-2 bg-primary text-primary-foreground rounded-xl font-medium active:scale-95 transition-transform"
            >
              <ExternalLink size={16} />
              Visit Website
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-3 py-2 border-b border-border/30 last:border-b-0">
    <span className="text-muted-foreground">{icon}</span>
    <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
    <span className="text-sm text-foreground text-right font-medium ml-auto truncate">{value}</span>
  </div>
);
