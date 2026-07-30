function PrivacyPolicy() {
  return (
    <div className="bg-white h-auto w-[1732px] mx-auto rounded-[8px] my-10 container">
      {/* Header Section */}
      <div className="legal-page-banner">
        <h1 className="text-white text-[24px] font-semibold m-0">
          Privacy Policies
        </h1>
      </div>

      {/* Content Section */}
      <div className="p-10">
        <p className="text-[#00000060] text-[16px] leading-[1.6] mb-6">
          At <strong className="text-black">Shopperbeats</strong> we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase from us.
        </p>

        {/* Section 1 */}
        <div className="mb-8">
          <h2 className="legal-heading">
            1. Information We Collect
          </h2>
          <p className="legal-text">
            <strong className="legal-strong">Personal Information:</strong> When you place an order or register an account on our website, we may collect personal information such as your name, email address, shipping address, and payment details.
          </p>
          <p className="legal-text">
            <strong className="legal-strong">Browsing Information:</strong> We may also collect non-personal information such as your IP address, browser type, device information, and cookies to enhance your browsing experience and improve our services.
          </p>
        </div>

        {/* Section 2 */}
        <div className="mb-8">
          <h2 className="legal-heading">
            2. How We Use Your Information
          </h2>
          <p className="legal-text">
            <strong className="legal-strong">Order Processing:</strong> We use your personal information to process and fulfill your orders, communicate with you regarding your purchases, and provide customer support.
          </p>
          <p className="legal-text">
            <strong className="legal-strong">Improving Our Services:</strong> We may use your browsing information to analyze trends, track user activity, and enhance the functionality and usability of our website.
          </p>
          <p className="legal-text">
            <strong className="legal-strong">Marketing and Promotions:</strong> With your consent, we may use your contact information to send you promotional offers, newsletters, and updates about our products and services.
          </p>
        </div>

        {/* Section 3 */}
        <div className="mb-8">
          <h2 className="legal-heading">
            3. Information Sharing and Disclosure
          </h2>
          <p className="legal-text">
            <strong className="legal-strong">Third-Party Service Providers:</strong> We may share your personal information with trusted third-party service providers who assist us in operating our website, conducting business activities, and delivering products and services to you.
          </p>
          <p className="legal-text">
            <strong className="legal-strong">Legal Compliance:</strong> We may disclose your information when required by law or in response to a valid legal request, such as a court order or government inquiry.
          </p>
        </div>

        {/* Section 4 */}
        <div className="mb-8">
          <h2 className="legal-heading">
            4. Payment & Security
          </h2>
          <p className="legal-text">
            Rest assured, your payment information is processed with the utmost security. At Shopperbeats, we prioritize your privacy and security. We never store credit card details or have access to your credit card information. We maintain strict adherence to the highest standards of server compliance through our trusted payment gateways, ensuring that your sensitive data remains protected at all times.
          </p>
        </div>

        {/* Section 5 */}
        <div className="mb-8">
          <h2 className="legal-heading">
            5. Data Security
          </h2>
          <p className="legal-text">
            We take the security of your information seriously and employ industry-standard security measures to protect against unauthorized access, disclosure, alteration, or destruction of your personal information. However, please note that no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.
          </p>
        </div>

        {/* Section 6 */}
        <div className="mb-8">
          <h2 className="legal-heading">
            6. Your Choices and Rights
          </h2>
          <p className="legal-text">
            <strong className="legal-strong">Opt-Out:</strong> You have the right to opt-out of receiving marketing communications from us at any time. You can unsubscribe from our promotional emails by following the instructions provided in the email.
          </p>
          <p className="legal-text">
            <strong className="legal-strong">Access and Correction:</strong>You have the right to access and update your personal information stored in your account. You may also request correction, deletion, or restriction of your information under certain circumstances
          </p>
        </div>

        {/* Section 7 */}
        <div className="mb-8">
          <h2 className="legal-heading">
            7. Changes to This Privacy Policy
          </h2>
          <p className="legal-text">
            We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page, and the effective date will be updated accordingly.We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page, and the effective date will be updated accordingly.
          </p>
        </div>

        {/* Section 8 */}
        <div className="mb-8">
          <h2 className="legal-heading">
            8. Contact Us
          </h2>
          <p className="legal-text">
            If you have any questions or concerns about our Privacy Policy or the handling of your personal information, please contact us.
          </p>
          <p className="legal-text italic mt-3">
            By using our website and services, you consent to the terms of this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
export default function PrivacyPolicyPage() {
  return (
    <PrivacyPolicy />
  );
};
