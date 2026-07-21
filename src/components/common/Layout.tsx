"use client";

import type { ComponentProps, ReactNode } from "react";
import Header from "../ui/Header";
import Footer from "../ui/Footer";
import "../../styles/Header.css";
import "../../styles/Footer.css";
import { FooterMenuData } from "@/types/menu";

type LayoutProps = {
  children: ReactNode;
  megaMenuData: ComponentProps<typeof Header>["megaMenuData"];
  footerMenuData: FooterMenuData;
};

export default function Layout({
  children,
  megaMenuData,
  footerMenuData,
}: LayoutProps) {
  return (
    <div>
      <Header megaMenuData={megaMenuData} />
      {children}
      <Footer footerMenuData={footerMenuData} />
    </div>
  );
}
