"use client";
import React, { useEffect } from "react";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/input";
import AddressAutocomplete from "../common/AddressAutocomplete";
import DeliveryDetailsForm from "./DeliveryDetailsForm";
import { CheckoutFormData } from "@/types/order";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
} from "@stripe/react-stripe-js";
import {
  fieldLabels,
  handleAustralianPhoneNumberChange,
} from "@/lib/utils/main-utils";
import { useIsClient } from "@/lib/hooks/use-is-client";
import Image from "next/image";
import { toast } from "react-toastify";
import { CheckoutFormProps } from "@/types/checkout";

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  formData,
  formErrors,
  handleChange,
  handlePayNow,
  setFormData,
  isCreatingOrder,
  useSavedAddress,
  setUseSavedAddress,
  savedAddresses,
  selectedAddressId,
  setSelectedAddressId,
  setFormErrors,
  onShippingAddressValid,
  onBillingAddressValid,
  setSelectedAddressData,
  isAuthenticated,
}) => {
  const mounted = useIsClient();

  const CHECKOUT_DATA_TTL_MS = 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCheckoutData = sessionStorage.getItem("checkoutFormData");
      if (savedCheckoutData) {
        try {
          const parsed = JSON.parse(savedCheckoutData);
          const { savedAt, ...parsedData } = parsed;
          const isExpired =
            typeof savedAt !== "number" ||
            Date.now() - savedAt > CHECKOUT_DATA_TTL_MS;

          if (isExpired) {
            sessionStorage.removeItem("checkoutFormData");
          } else {
            setFormData((prev) => ({
              ...prev,
              ...parsedData,
            }));
            toast.success(
              "Your saved details have been loaded for express checkout",
              {
                toastId: "checkout-saved-details-loaded",
                position: "top-right",
                autoClose: 3000,
              },
            );
          }
        } catch (error) {
          console.error("Error loading saved checkout data:", error);
          sessionStorage.removeItem("checkoutFormData");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFormData]);

  useEffect(() => {
    if (typeof window !== "undefined" && mounted) {
      const dataToSave = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        country: formData.country,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postcode: formData.postcode,
        apartment: formData.apartment,
        company: formData.company,
        savedAt: Date.now(),
      };
      sessionStorage.setItem("checkoutFormData", JSON.stringify(dataToSave));
    }
  }, [formData, mounted]);

  useEffect(() => {
    if (mounted) {
      Object.entries(formErrors).forEach(([field, error]) => {
        if (error) {
          const label = fieldLabels[field] || field;
          toast.error(`${label}: ${error}`, {
            toastId: `error-${field}`,
            position: "top-right",
            autoClose: 3000,
          });
        }
      });
    }
  }, [formErrors, mounted]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;

    const { value, error } = handleAustralianPhoneNumberChange(
      e,
      formData[name as keyof CheckoutFormData] as string,
    );

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const stripeFieldStyle = {
    base: {
      fontSize: "16px",
      color: "#111827",
      "::placeholder": { color: "#9CA3AF" },
    },
    invalid: { color: "#DC2626" },
  };

  return (
    <form id="checkout-form" className="checkout-form" onSubmit={handlePayNow}>
      <div className="contact-section">
        <div className="contact-card-box">
          <div className="contact-details">
            <h5 className="contact-heading">Contact</h5>
            <div className="mb-5">
              <Input
                id="email"
                type="text"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                error={formErrors.email}
                className="contact-email-input"
              />
              <label className="delivery-checkbox-label">
                <input type="checkbox" /> Email me with news and offers
              </label>
            </div>
          </div>
        </div>
      </div>
      <DeliveryDetailsForm
        formData={formData}
        formErrors={formErrors}
        handleChange={handleChange}
        handlePhoneChange={handlePhoneChange}
        setFormData={setFormData}
        setFormErrors={setFormErrors}
        useSavedAddress={useSavedAddress}
        setUseSavedAddress={setUseSavedAddress}
        savedAddresses={savedAddresses}
        selectedAddressId={selectedAddressId}
        setSelectedAddressId={setSelectedAddressId}
        onShippingAddressValid={onShippingAddressValid}
        setSelectedAddressData={setSelectedAddressData}
        isAuthenticated={isAuthenticated}
      />
      <div className="payment-section">
        <div className="payment-card-box">
          <div className="payment-details">
            <h5 className="payment-heading">Payment</h5>
            <p className="payment-subtext">
              All transactions are secure and encrypted.
            </p>

            <div className="payment-method-box">
              <label htmlFor="CreditCard" className="payment-method-toggle">
                <span className="payment-method-name">
                  <input
                    type="radio"
                    name="paymentMethod"
                    id="CreditCard"
                    value={"CreditCard"}
                    checked={formData.paymentMethod === "CreditCard"}
                    onChange={handleChange}
                  />
                  Credit Card
                </span>
                <span className="payment-logos dflex">
                  <span className="payment-img">
                    <Image
                      src="/images/visa.svg"
                      alt="Visa"
                      width={30}
                      height={20}
                    />
                  </span>
                  <span className="payment-img">
                    <Image
                      src="/images/payment.svg"
                      alt="Mastercard"
                      width={30}
                      height={20}
                    />
                  </span>
                  <span className="payment-img">
                    <Image
                      src="/images/american.svg"
                      alt="Amex"
                      width={30}
                      height={20}
                    />
                  </span>
                </span>
              </label>

              {formData.paymentMethod === "CreditCard" && (
                <div className="card-fields">
                  <div className="form-item">
                    <div className="card-field-box">
                      <CardNumberElement
                        options={{
                          showIcon: true,
                          placeholder: "Card Number",
                          style: stripeFieldStyle,
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-fields dflex">
                    <div className="form-item">
                      <div className="card-field-box">
                        <CardExpiryElement
                          options={{ style: stripeFieldStyle }}
                        />
                      </div>
                    </div>
                    <div className="form-item">
                      <div className="card-field-box">
                        <CardCvcElement
                          options={{
                            placeholder: "Security code",
                            style: stripeFieldStyle,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-item">
                    <Input
                      type="text"
                      name="cardholderName"
                      placeholder="Name on Card"
                      value={formData.cardholderName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div className="billing-toggle-row">
                <input
                  type="checkbox"
                  name="useShippingAddressAsBilling"
                  checked={formData.useShippingAddressAsBilling}
                  onChange={(e) =>
                    setFormData((prev: CheckoutFormData) => ({
                      ...prev,
                      useShippingAddressAsBilling: e.target.checked,
                    }))
                  }
                />
                Use shipping address as billing address
              </div>
              {!formData.useShippingAddressAsBilling && (
                <div className="delivery-details billing-address-block">
                  <div className="form-item">
                    <h5>Billing Address</h5>
                  </div>
                  <div className="form-item select-field">
                    <Input
                      type="text"
                      name="billingCountry"
                      placeholder="Country"
                      value={formData.billingCountry}
                      onChange={(e) => {
                        handleChange(e);
                        onBillingAddressValid(false);
                      }}
                      error={formErrors.billingCountry}
                    />
                  </div>
                  <div className="form-fields dflex">
                    <div className="form-item">
                      <label htmlFor="billingFirstName">First name*</label>
                      <Input
                        id="billingFirstName"
                        type="text"
                        name="billingFirstName"
                        placeholder="First name"
                        value={formData.billingFirstName}
                        onChange={handleChange}
                        error={formErrors.billingFirstName}
                      />
                    </div>
                    <div className="form-item">
                      <label htmlFor="billingLastName">Last name*</label>
                      <Input
                        id="billingLastName"
                        type="text"
                        name="billingLastName"
                        placeholder="Last name"
                        value={formData.billingLastName}
                        onChange={handleChange}
                        error={formErrors.billingLastName}
                      />
                    </div>
                  </div>
                  <div className="form-item">
                    <label htmlFor="billingCompany">Company (optional)</label>
                    <Input
                      id="billingCompany"
                      type="text"
                      name="billingCompany"
                      placeholder="Company (optional)"
                      value={formData.billingCompany}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-item">
                    <label htmlFor="billingAddress">Address*</label>
                    <AddressAutocomplete
                      id="billingAddress"
                      placeholder="Address"
                      value={formData.billingAddress}
                      onValidPlace={onBillingAddressValid}
                      onChange={(val) => {
                        setFormData((prev: CheckoutFormData) => ({
                          ...prev,
                          billingAddress: val,
                        }));
                        setFormErrors((prev) => ({
                          ...prev,
                          billingAddress: "",
                        }));
                      }}
                      onPlaceSelect={(data) => {
                        setFormData((prev: CheckoutFormData) => ({
                          ...prev,
                          billingAddress: data.address,
                          billingCity: data.city,
                          billingState: data.state,
                          billingPostcode: data.pincode,
                          billingCountry: data.country,
                        }));

                        setFormErrors((prev) => ({
                          ...prev,
                          billingAddress: "",
                          billingCity: "",
                          billingState: "",
                          billingPostcode: "",
                          billingCountry: "",
                        }));
                      }}
                    />
                    {formErrors.billingAddress && (
                      <p className="error">{formErrors.billingAddress}</p>
                    )}
                  </div>
                  <div className="form-item">
                    <Input
                      id="billingApartment"
                      type="text"
                      name="billingApartment"
                      placeholder="Apartment, suite, etc. (optional)"
                      value={formData.billingApartment}
                      onChange={handleChange}
                      label="Apartment, suite, etc. (optional)"
                    />
                  </div>
                  <div className="form-fields dflex">
                    <div className="form-item">
                      <Input
                        id="billingCity"
                        type="text"
                        name="billingCity"
                        placeholder="City"
                        label="City*"
                        value={formData.billingCity}
                        onChange={(e) => {
                          handleChange(e);
                          onBillingAddressValid(false);
                        }}
                        error={formErrors.billingCity}
                      />
                    </div>
                    <div className="form-item select-field">
                      <Input
                        id="billingState"
                        type="text"
                        name="billingState"
                        placeholder="State"
                        label="State*"
                        value={formData.billingState}
                        onChange={(e) => {
                          handleChange(e);
                          onBillingAddressValid(false);
                        }}
                        error={formErrors.billingState}
                      />
                    </div>
                    <div className="form-item my-6">
                      <Input
                        id="billingPostcode"
                        onWheel={(e) => e.currentTarget.blur()}
                        type="number"
                        name="billingPostcode"
                        placeholder="Postcode"
                        value={formData.billingPostcode}
                        onChange={(e) => {
                          handleChange(e);
                          onBillingAddressValid(false);
                        }}
                        error={formErrors.billingPostcode}
                      />
                    </div>
                  </div>
                  <div className="form-item">
                    <Input
                      id="billingPhone"
                      type="tel"
                      name="billingPhone"
                      placeholder="Phone"
                      label="Phone*"
                      value={formData.billingPhone}
                      onChange={handlePhoneChange}
                      maxLength={12}
                      error={formErrors.billingPhone}
                    />
                  </div>
                </div>
              )}
            </div>

           {/* OTHER PAYMENT OPTIONS */}
            <div className="payment-option-group xl:-mx-4 py-1">
              <div
                className={`payment-option ${formData.paymentMethod === "paypal" ? "active" : ""}`}
              >
                <div className="payment-item flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    id="paypal"
                    value="paypal"
                    checked={formData.paymentMethod === "paypal"}
                    onChange={handleChange}
                    className="payment-radio"
                  />
                  <label
                    htmlFor="paypal"
                    className="checkout-field-heading"
                  >
                    PayPal
                  </label>
                  <span style={{ marginLeft: "auto" }}>
                    <Image
                      src="/images/paypal.svg"
                      alt="Paypal"
                      width={60}
                      height={30}
                    />
                  </span>
                </div>
              </div>
              <div
                className={`payment-option ${formData.paymentMethod === "afterpay" ? "active" : ""}`}
              >
                <div className="payment-item flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    id="afterpay"
                    value="afterpay"
                    checked={formData.paymentMethod === "afterpay"}
                    onChange={handleChange}
                    className="payment-radio"
                  />
                  <label
                    htmlFor="afterpay"
                    className="checkout-field-heading"
                  >
                    Afterpay
                  </label>
                  <span style={{ marginLeft: "auto" }}>
                    <Image
                      src="/images/afterpay.svg"
                      alt="Afterpay"
                      width={80}
                      height={20}
                    />
                  </span>
                </div>
              </div>
              <div
                className={`payment-option ${formData.paymentMethod === "zip" ? "active" : ""}`}
              >
                <div className="payment-item flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    id="zip"
                    value="zip"
                    checked={formData.paymentMethod === "zip"}
                    onChange={handleChange}
                    className="payment-radio"
                  />
                  <label
                    htmlFor="zip"
                    className="checkout-field-heading"
                  >
                    Zippy
                  </label>
                  <span style={{ marginLeft: "auto" }}>
                    <Image
                      src="/images/zip.svg"
                      alt="Zippay"
                      width={50}
                      height={20}
                    />
                  </span>
                </div>
              </div>
            </div>

            {formErrors.paymentMethod && (
              <p className="error">{formErrors.paymentMethod}</p>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex justify-center mt-5">
        <Button
          className="global-btn"
          type="submit"
          disabled={isCreatingOrder}
          isLoading={isCreatingOrder}
        >
          {isCreatingOrder ? "Placing Order..." : "Pay Now"}
        </Button>
      </div>
    </form>
  );
};

export default CheckoutForm;
