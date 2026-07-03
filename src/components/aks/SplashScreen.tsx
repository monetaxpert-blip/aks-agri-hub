import { useEffect, useState } from "react";
import { AKS_ASSETS } from "@/lib/aks-assets";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("aks_splash_seen") === "1") {
        setVisible(false);
        return;
      }
    } catch {}
    const t1 = setTimeout(() => setFade(true), 1300);
    const t2 = setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem("aks_splash_seen", "1"); } catch {}
    }, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"}`}
      style={{ backgroundImage: `url(${AKS_ASSETS.splash})`, backgroundSize: "cover", backgroundPosition: "center" }}
    />
  );
}
