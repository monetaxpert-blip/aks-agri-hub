import logo from "@/assets/ak-logo.png.asset.json";
import splash from "@/assets/ak-splash.png.asset.json";
import leafyBg from "@/assets/ak-leafy-bg.jpg.asset.json";
import farmers from "@/assets/ak-farmers.jpg.asset.json";
import farmerTomatoes from "@/assets/ak-farmer-tomatoes.jpg.asset.json";

export const AKS_ASSETS = {
  logo: logo.url,
  splash: splash.url,
  leafyBg: leafyBg.url,
  farmers: farmers.url,
  farmerTomatoes: farmerTomatoes.url,
};

export const AKS_CONTACT = {
  phone: "+221 76 288 61 07",
  phoneRaw: "221762886107",
  email: "agrokonnectesenegal@gmail.com",
  waLink: (message?: string) =>
    `https://wa.me/221762886107${message ? `?text=${encodeURIComponent(message)}` : ""}`,
};
