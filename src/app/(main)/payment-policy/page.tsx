function PaymentPolicy() {
  return (
    <div className="legal-page-container">
      <div className="bg-white overflow-hidden">
        {/* Header Section */}
        <div className="legal-page-banner">
          <h1 className="legal-title">
            Payment Policy123
          </h1>
        </div>

        {/* Content Section */}
        <div className="p-10">
          <p className="legal-intro">
            Payment Policy Page Comming Soon
          </p>
        </div>
      </div>
    </div>
  );
};
export default function PaymentPolicyPage () {
  return (
     <PaymentPolicy />
  );
};