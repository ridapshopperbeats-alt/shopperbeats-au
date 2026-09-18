import TopNavbar from "../ui/TopNavbar";
import Footer from "../ui/Footer";
import MobileBottomNav from "../ui/MobileBottomNav";
import "../../styles/Header.css";
import "../../styles/Footer.css";
import type { LayoutProps } from "@/types/ui";


export default function Layout({
  children,
  megaMenuData,
  footerMenuData,
}: LayoutProps) {
  return (
    <div className="pb-[45px] md:pb-0">
      <TopNavbar megaMenuData={megaMenuData} />
      {children}
      <Footer footerMenuData={footerMenuData} />
      <MobileBottomNav />
    </div>
  );
}
