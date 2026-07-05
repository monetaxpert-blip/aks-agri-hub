import logo from "@/assets/ak-logo.png";
import splash from "@/assets/ak-splash.png";
import leafyBg from "@/assets/ak-leafy-bg.jpg";
import farmers from "@/assets/ak-farmers.jpg";
import farmerTomatoes from "@/assets/ak-farmer-tomatoes.jpg";
import loginMockup from "@/assets/ak-login-mockup.png";

export const AKS_ASSETS = {
  logo,
  splash,
  leafyBg,
  farmers,
  farmerTomatoes,
  loginMockup,
};

export const AKS_CONTACT = {
  phone: "+221 76 288 61 07",
  phoneRaw: "221762886107",
  email: "agrokonnectesenegal@gmail.com",
  waLink: (message?: string) =>
    `https://wa.me/221762886107${message ? `?text=${encodeURIComponent(message)}` : ""}`,
};
