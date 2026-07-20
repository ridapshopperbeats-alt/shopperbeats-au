"use client";

import Header, { MegaMenuCategory } from "./Header";
import Footer from "./Footer";
import "../../styles/Header.css";
import "../../styles/Footer.css";
import { FooterMenuData } from "@/types/menu";


export default function Layout({
  children,
  megaMenuData,
  footerMenuData,
}: {
  children: React.ReactNode;
  megaMenuData: MegaMenuCategory[];
  footerMenuData: FooterMenuData;
}) {
  return (
     <div>
     {<Header megaMenuData={megaMenuData} />}
      {children}
      <Footer footerMenuData={footerMenuData} />
    </div>
  );
}
