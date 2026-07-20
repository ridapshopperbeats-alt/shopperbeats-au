"use client";

function ShippingDelivery() {
  return (
    <div className="text-black mx-auto  py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white overflow-hidden">
        {/* Header Section */}
        <div className="bg-[#FD151B] px-10 py-[16px] rounded-tr-[8px] rounded-tl-[8px] ">
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '600', margin: '0' }}>
            Shipping Delivery
          </h1>
        </div>

        {/* Content Section */}
        <div className="p-10">
          <p style={{ color: '#00000060', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
            Shipping Delivery Page Comming Soon
          </p>
        </div>
      </div>
    </div>
  );
};
export default function ShippingDeliveryPage () {
  return (
     <ShippingDelivery />
  );
};