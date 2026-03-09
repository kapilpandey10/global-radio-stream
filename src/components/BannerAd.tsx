import { useEffect, useRef } from "react";

export const BannerAd = ({ className }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !containerRef.current) return;
    initialized.current = true;

    try {
      if (typeof (window as any).aclib !== "undefined") {
        (window as any).aclib.runBanner({ zoneId: "11051154" });
      }
    } catch (e) {
      console.warn("Banner ad failed to load", e);
    }
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <div id={`ac-banner-${Math.random().toString(36).slice(2, 8)}`} />
    </div>
  );
};
