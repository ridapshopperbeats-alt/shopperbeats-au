import Home from "@/components/homepage/Home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopperbeats - Your One-Stop Online Shop",
  description: "Discover amazing deals on electronics, home goods, fashion, and more at Shopperbeats. Shop smart, live happy!",
};

export default async function Page() {

  return (
    <div>
      <Home/>
    </div>
  );
}
