import React from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { getImageUrl } from "@/lib/utils/main-utils";

const TEXT_CLASS =
  "font-normal text-[14px] leading-[30px] tracking-[0px] align-middle text-black";

export const getDeliveryTabContent = (product: Product) => {
  const location = product?.ships_from_location;

  let estimatedDelivery = null;

  if (location === "USA" || location === "China") {
    estimatedDelivery = (
      <p className={TEXT_CLASS}>Orders shipped from outside Australia: 15–21 business days</p>
    );
  } else if (location === "SBAU" || location === "Local 3PL") {
    estimatedDelivery = (
      <p className={TEXT_CLASS}>Orders shipped from Australia: 10–12 business days</p>
    );
  }

  return (
    <>
      <h6 className="py-4">Delivery Information</h6>
      <p className={TEXT_CLASS}>
        We aim to process and dispatch all orders as quickly as possible.
        Delivery times may vary based on the shipping origin and destination.
      </p>
      <br />

      <h6>Estimated Delivery Timeframes</h6>
      {estimatedDelivery}
      <br />
      <h6>Important Information</h6>
      <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
        <li className={TEXT_CLASS}>
          Order processing time and the most accurate delivery estimates are
          displayed at checkout before you place your order.
        </li>
        <li className={TEXT_CLASS}>
          Delivery times are estimates and may vary due to customs clearance,
          courier delays, public holidays, or unforeseen circumstances.
        </li>
        <li className={TEXT_CLASS}>Tracking details will be provided once the order has been shipped.</li>
        <li className={TEXT_CLASS}>Remote locations may require additional delivery time.</li>
      </ul>
    </>
  );
};

export const warrantyAndReturnContent = (
  <>
    <h3 className="py-4">Return & Refund Policy:</h3>

    <p className={TEXT_CLASS}>
      We want you to shop with confidence and be completely satisfied with your
      purchase. If something isn’t right, our team is here to help.
    </p>

    <br />

    <b>1. Change of Mind Returns</b>
    <p className={TEXT_CLASS}>
      We accept change of mind returns within 14 days of receiving your order,
      provided that:
    </p>

    <ul>
      <li className={TEXT_CLASS}>The item is unused, unopened, and in its original packaging</li>
      <li className={TEXT_CLASS}>The item is unused, unopened, and in its original packaging</li>
      <li className={TEXT_CLASS}>
        Return postage is at the customer’s expense unless otherwise stated
      </li>
    </ul>

    <b>2. Faulty or Incorrect Items</b>

    <ul>
      <li className={TEXT_CLASS}>Contact us within 7 days of delivery</li>
      <li className={TEXT_CLASS}>Provide your order number and photos/videos</li>
      <li className={TEXT_CLASS}>
        Return shipping costs for faulty or incorrect items will be covered by
        us
      </li>
    </ul>

    <b>Non-returnable items:</b>

    <ul>
      <li className={TEXT_CLASS}>Personal care, beauty, and grooming items</li>
      <li className={TEXT_CLASS}>Intimate apparel</li>
      <li className={TEXT_CLASS}>Customised or personalised products</li>
      <li className={TEXT_CLASS}>Clearance or final sale items (unless faulty)</li>
    </ul>

    <b>Need Help?</b>
    <p className={TEXT_CLASS}>
      📧 cs@shopperbeats.com.au <br />
      📞 +61 406 958 192
    </p>
  </>
);

export const getFeaturesContent = (
  product: Product,
  options?: { hideHeading?: boolean },
) => (
  <>
    <div className="py-4">
      {!options?.hideHeading && <b>Features:</b>}
      <ul className="list-disc pl-5 space-y-1 marker:text-black">
        <li className={TEXT_CLASS}>
          Static Data
        </li>
      </ul>

      <div className="mt-4">
        <Image
          src={getImageUrl(product)}
          alt={product.title || "Product image"}
          width={1300}
          height={400}
          className="w-full max-w-[1300px] h-[400px] object-cover"
        />

      </div>
    </div>
  </>
);

export const getProductDetailsContent = (product: Product) => (
  <>
    <div className="py-4">
      <b>Product Details: Statistic Data</b>
      <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
        <li className={TEXT_CLASS}>
          Static Data
        </li>
      </ul>

      <div className="mt-4">
        <Image
          src={getImageUrl(product)}
          alt={product.title || "Product image"}
          width={1300}
          height={260}
          className="w-full max-w-[1300px] h-[260px] object-cover"
        />
      </div>
    </div>
  </>
);

export const getStyleGuideContent = (product: Product) => (
  <>
    <div className="py-4">
      <b>Style Guide</b>
      <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
        <li className={TEXT_CLASS}>
          Static Data
        </li>
      </ul>

      <div className="mt-4">
        <Image
          src={getImageUrl(product)}
          alt={product.title || "Product image"}
          width={1300}
          height={260}
          className="w-full max-w-[1300px] h-[260px] object-cover"
        />
      </div>
    </div>
  </>
);

export const getItemsDetailsContent = (product: Product) => (
  <>
    <div className="py-4">
      <b>Item Details: Statistic Data</b>
      <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
        <li className={TEXT_CLASS}>
          Static Data
        </li>
      </ul>

      <div className="mt-4">
        <Image
          src={getImageUrl(product)}
          alt={product.title || "Product image"}
          width={1300}
          height={260}
          className="w-full max-w-[1300px] h-[260px] object-cover"
        />
      </div>
    </div>
  </>
);
