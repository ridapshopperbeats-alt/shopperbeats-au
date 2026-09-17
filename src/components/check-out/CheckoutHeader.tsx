import Image from "next/image";
import Link from "next/link";
import CartPopup from "@/components/ui/CartPopup";

export default function CheckoutHeader() {
  return (
    <div className="header-fixed" style={{ boxShadow: "none" }}>
      <div className="container flex flex-col">
        <div className="top-head no-search">
          <div className="logo-block">
            <div className="logo">
              <Link href="/">
                <Image
                  src="/images/logo.svg"
                  alt="ShopperBeats Logo"
                  width={300}
                  height={300}
                  priority
                />
              </Link>
            </div>
          </div>

          <div className="login-block">
            <CartPopup isVisible={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
