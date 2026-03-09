import { RadioStation } from "@/types/radio";
import { toast } from "sonner";

export const shareStation = async (station: RadioStation) => {
  const shareText = `I'm listening to ${station.name} on Mero Radio! 🎵`;
  const shareUrl = `https://radio.pandeykapil.com.np/search?q=${encodeURIComponent(station.name)}`;

  // Check if Web Share API is available (mobile devices)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${station.name} - Mero Radio`,
        text: shareText,
        url: shareUrl,
      });
      return true;
    } catch (err) {
      // User cancelled share or error occurred
      if ((err as Error).name !== 'AbortError') {
        console.warn('Share failed:', err);
      }
      return false;
    }
  }

  // Fallback: copy to clipboard (desktop)
  try {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    toast.success("Link copied to clipboard!", {
      description: "Share it with your friends",
      duration: 3000,
    });
    return true;
  } catch (err) {
    toast.error("Failed to share", {
      description: "Please try again",
      duration: 3000,
    });
    return false;
  }
};
