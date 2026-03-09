import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const VAST_TAG_URL = "https://youradexchange.com/video/select.php?r=11050994";

const VideoAdWidget = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);

  useEffect(() => {
    if (!videoRef.current || playerRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      muted: true,
      preload: "auto",
      fluid: true,
      aspectRatio: "16:9",
    });

    playerRef.current = player;

    // Load IMA plugin for VAST support
    import("videojs-ima").then(() => {
      if (player && typeof (player as any).ima === "function") {
        (player as any).ima({
          adTagUrl: VAST_TAG_URL,
        });
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm">
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-fluid"
          playsInline
        />
      </div>
    </div>
  );
};

export default VideoAdWidget;
