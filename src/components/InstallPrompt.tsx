import { useState, useEffect } from "react";
import { X, Share, Plus, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const isIOS = () => {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const isInStandaloneMode = () =>
  ('standalone' in window.navigator && (window.navigator as any).standalone) ||
  window.matchMedia('(display-mode: standalone)').matches;

export const InstallPrompt = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari, not already installed, not previously dismissed this session
    const alreadyDismissed = sessionStorage.getItem("install-prompt-dismissed");
    if (isIOS() && !isInStandaloneMode() && !alreadyDismissed) {
      // Delay showing to not interrupt initial experience
      const timer = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    sessionStorage.setItem("install-prompt-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-24 left-3 right-3 z-[60] max-w-md mx-auto"
        >
          <div className="bg-card border border-border/60 rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-3">
                <img src="/apple-touch-icon.png" alt="Mero Radio" className="w-10 h-10 rounded-xl" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Install Mero Radio</h3>
                  <p className="text-xs text-muted-foreground">Add to your Home Screen</p>
                </div>
              </div>
              <button onClick={handleDismiss} className="p-1.5 rounded-full hover:bg-muted active:scale-90 transition-all">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Steps */}
            <div className="px-4 pb-4 pt-2 space-y-3">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p className="text-xs text-foreground">
                  Tap the <Share size={14} className="inline text-primary mx-0.5 -mt-0.5" /> <strong>Share</strong> button in Safari's toolbar
                </p>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p className="text-xs text-foreground">
                  Scroll down and tap <Plus size={14} className="inline text-primary mx-0.5 -mt-0.5" /> <strong>Add to Home Screen</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p className="text-xs text-foreground">
                  Tap <strong>Add</strong> — Mero Radio will appear on your Home Screen!
                </p>
              </div>
            </div>

            {/* Arrow pointing down to Safari bar */}
            <div className="flex justify-center pb-3">
              <ArrowDown size={20} className="text-primary animate-bounce" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
