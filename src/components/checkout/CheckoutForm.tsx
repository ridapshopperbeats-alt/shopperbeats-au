"use client";
import React, { useEffect } from "react";
import Button from "@/components/ui/Button";
import AddressAutocomplete from "../ui/AddressAutocomplete";
import { Address } from "@/types/address";
import { CheckoutFormData } from "@/types/order";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
} from "@stripe/react-stripe-js";
import { handleAustralianPhoneNumberChange } from "@/lib/utils/main-utils";
import { useIsClient } from "@/lib/hooks/use-is-client";
import Image from "next/image";
import { toast } from "react-toastify";

interface CheckoutFormProps {
  formData: CheckoutFormData;
  formErrors: Partial<Record<keyof CheckoutFormData, string>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handlePayNow: (e: React.FormEvent<HTMLFormElement>) => void;
  setFormData: (data: React.SetStateAction<CheckoutFormData>) => void;
  setFormErrors: React.Dispatch<
    React.SetStateAction<Partial<Record<keyof CheckoutFormData, string>>>
  >;
  isCreatingOrder: boolean;
  useSavedAddress: boolean;
  setUseSavedAddress: (value: boolean) => void;
  savedAddresses: Address[];
  selectedAddressId: number | null;
  setSelectedAddressId: (id: number | null) => void;
  onShippingAddressValid: (valid: boolean) => void;
  onBillingAddressValid: (valid: boolean) => void;
  shippingCost: number;
  isAuthenticated: boolean;
  setSelectedAddressData: React.Dispatch<
    React.SetStateAction<{
      city: string;
      state: string;
      postcode: string;
    } | null>
  >;
}

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

  // Load saved checkout details from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCheckoutData = localStorage.getItem("checkoutFormData");
      if (savedCheckoutData) {
        try {
          const parsedData = JSON.parse(savedCheckoutData);
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
        } catch (error) {
          console.error("Error loading saved checkout data:", error);
        }
      }
    }
  }, [setFormData]);

  // Save checkout details to localStorage when form data changes
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
      };
      localStorage.setItem("checkoutFormData", JSON.stringify(dataToSave));
    }
  }, [formData, mounted]);

  // Show toast notifications for validation errors
  useEffect(() => {
    if (mounted) {
      Object.entries(formErrors).forEach(([field, error]) => {
        if (error) {
          const fieldLabels: Record<string, string> = {
            email: "Email",
            firstName: "First name",
            lastName: "Last name",
            phone: "Phone",
            country: "Country",
            address: "Address",
            city: "City",
            state: "State",
            postcode: "Postcode",
            billingCountry: "Billing country",
            billingFirstName: "Billing first name",
            billingLastName: "Billing last name",
            billingAddress: "Billing address",
            billingCity: "Billing city",
            billingState: "Billing state",
            billingPostcode: "Billing postcode",
            billingPhone: "Billing phone",
            paymentMethod: "Payment method",
          };
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
  const cardFieldBox: React.CSSProperties = {
    border: "1px solid #E5E5E5",
    borderRadius: "8px",
    padding: "14px 12px",
    background: "#fff",
  };

  return (
    <form id="checkout-form" className="checkout-form" onSubmit={handlePayNow}>
      <div className="flex flex-col gap-5 w-full xl:sticky xl:self-start">
        <div
          className="w-full lg:min-h-[160px] border border-[#F8F8F8] rounded-[8px] p-5 flex flex-col gap-4"
          style={{
            background: "#FFFFFF",
            boxShadow: "0px 0px 4px 0px #0000001A",
          }}
        >
          <div className="contact-details">
            <h5 className="font-bold text-[16px] leading-[20px] mb-4">
              Contact
            </h5>
            <div className="form-item">
              <input
                id="email"
                type="text"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="font-montserrat"
                style={{
                  height: "46px",
                  borderRadius: "5px",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "0%",
                }}
              />
              {formErrors.email && <p className="error">{formErrors.email}</p>}
              <label
                className="flex items-center gap-2 mt-5 font-montserrat"
                style={{
                  color: "#4F4F4F",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "0%",
                }}
              >
                <input type="checkbox" /> Email me with news and offers
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5 w-full xl:sticky xl:self-start mt-5">
        <div
          className="w-full lg:min-h-[648px] rounded-[8px] p-5 flex flex-col gap-4"
          style={{
            background: "#FFFFFF",
            boxShadow: "0px 0px 14px 0px #00000014",
          }}
        >
          <div className="delivery-details ">
            <div className="form-item flex items-center gap-6">
              <label
                className="flex items-center gap-2 font-montserrat"
                style={{
                  fontWeight: 700,
                  fontSize: "12px",
                  lineHeight: "20px",
                  letterSpacing: "0%",
                  color: "#000000",
                }}
              >
                <input
                  type="radio"
                  name="deliveryOption"
                  checked={!useSavedAddress}
                  onChange={() => {
                    setUseSavedAddress(false);
                    setSelectedAddressId(null);
                    onShippingAddressValid(false);
                  }}
                />
                Add New Delivery
              </label>
              {isAuthenticated && (
                <label
                  className="flex items-center gap-2 font-bold text-[12px] leading-[20px] text-black"
                >
                  <input
                    type="radio"
                    name="deliveryOption"
                    checked={useSavedAddress}
                    onChange={() => {
                      setUseSavedAddress(true);
                      setSelectedAddressId(null);
                      onShippingAddressValid(true);
                      setFormErrors((prev) => ({
                        ...prev,
                        firstName: "",
                        lastName: "",
                        address: "",
                        city: "",
                        state: "",
                        pincode: "",
                        country: "",
                        phone: "",
                      }));
                    }}
                  />
                  Use Saved Address
                </label>
              )}
            </div>
            {isAuthenticated && useSavedAddress && (
              <div className="mb-2 lg:mb-6">
                {savedAddresses.map((addr) => {
                  const id = addr.id;
                  if (id == null) return null;

                  return (
                    <label
                      key={id}
                      className={`flex flex-col pb-2 mb-2 border-b border-[#333333] last:border-b-0 ${
                        selectedAddressId === id ? "active" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={selectedAddressId === id}
                          onChange={() => setSelectedAddressId(id)}
                          className="w-[13px] h-[13px] accent-[#01295F]"
                        />
                        <strong className="text-[12px]">{addr.title}</strong>
                      </div>

                      <div className="py-1 text-[12px]">
                        <p>{addr.address}</p>
                        {addr.city}, {addr.state} {addr.pincode}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="form-item select-field">
              <input
                type="text"
                name="country"
                placeholder="Country / Region"
                value={formData.country}
                onChange={(e) => {
                  handleChange(e);
                  onShippingAddressValid(false);
                }}
              />
              {formErrors.country && (
                <p className="error">{formErrors.country}</p>
              )}
            </div>

            <div className="form-fields dflex">
              <div className="form-item">
                <label htmlFor="firstName" className="sr-only">
                  First name*
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                {formErrors.firstName && (
                  <p className="error">{formErrors.firstName}</p>
                )}
              </div>
              <div className="form-item">
                <label htmlFor="lastName" className="sr-only">
                  Last name*
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {formErrors.lastName && (
                  <p className="error">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="form-item">
              <label htmlFor="company" className="sr-only">
                Company (optional)
              </label>
              <input
                id="company"
                type="text"
                name="company"
                placeholder="Company (optional)"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="form-item">
              {!useSavedAddress ? (
                <>
                  <label htmlFor="shippingAddress" className="sr-only">
                    Address*
                  </label>
                  <AddressAutocomplete
                    id="shippingAddress"
                    placeholder="Address"
                    value={formData.address}
                    onValidPlace={onShippingAddressValid}
                    onChange={(val) => {
                      setFormData((prev: CheckoutFormData) => ({
                        ...prev,
                        address: val,
                      }));
                      setFormErrors((prev) => ({
                        ...prev,
                        address: "",
                      }));
                    }}
                    onPlaceSelect={(data) => {
                      setSelectedAddressData({
                        city: data.city,
                        state: data.state,
                        postcode: data.pincode,
                      });
                      setFormData((prev: CheckoutFormData) => ({
                        ...prev,
                        address: data.address,
                        city: data.city,
                        state: data.state,
                        postcode: data.pincode,
                        country: data.country,
                      }));

                      setFormErrors((prev) => ({
                        ...prev,
                        address: "",
                        city: "",
                        state: "",
                        postcode: "",
                        country: "",
                      }));
                    }}
                  />
                </>
              ) : (
                <>
                  <label htmlFor="address" className="sr-only">
                    Address*
                  </label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </>
              )}
              {formErrors.address && (
                <p className="error">{formErrors.address}</p>
              )}
            </div>

            <div className="form-item">
              <label htmlFor="apartment" className="sr-only">
                Apartment, suite, etc. (optional)
              </label>
              <input
                id="apartment"
                type="text"
                name="apartment"
                placeholder="Apartment, suite, etc. (optional)"
                value={formData.apartment}
                onChange={handleChange}
              />
            </div>

            <div className="form-fields dflex">
              <div className="form-item">
                <label htmlFor="city" className="sr-only">
                  City*
                </label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => {
                    handleChange(e);
                    onShippingAddressValid(false);
                  }}
                  required
                />
                {formErrors.city && <p className="error">{formErrors.city}</p>}
              </div>
              <div className="form-item select-field">
                <label htmlFor="state" className="sr-only">
                  State*
                </label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => {
                    handleChange(e);
                    onShippingAddressValid(false);
                  }}
                  required
                />
                {formErrors.state && (
                  <p className="error">{formErrors.state}</p>
                )}
              </div>
            </div>

            <div className="form-item">
              <label htmlFor="postcode" className="sr-only">
                Postcode*
              </label>
              <input
                id="postcode"
                onWheel={(e) => e.currentTarget.blur()}
                type="number"
                name="postcode"
                placeholder="Postcode"
                value={formData.postcode}
                onChange={(e) => {
                  handleChange(e);
                  onShippingAddressValid(false);
                }}
                required
              />
              {formErrors.postcode && (
                <p className="error">{formErrors.postcode}</p>
              )}
            </div>

            <div className="form-item">
              <label htmlFor="phone" className="sr-only">
                Phone*
              </label>
              <input
                id="phone"
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength={12}
                required
              />

              {formErrors.phone && <p className="error">{formErrors.phone}</p>}
              <label
                className="flex items-center gap-2 mt-5 font-montserrat"
                style={{
                  color: "#4F4F4F",
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: "20px",
                  letterSpacing: "0%",
                }}
              >
                <input type="checkbox" /> Keep me up to date on news and
                exclusive offers via email and text messages
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5 w-full xl:sticky xl:self-start mt-5 h-auto">
        <div className="w-full h-auto border border-[#ECECEC] shadow shadow-[#000000]/10 rounded-[7px] p-4 flex flex-col gap-4">
          <div className="payment-details">
            <h5 className="text-[20px] font-bold text-black mb-4 lg:mb-0">
              Payment
            </h5>
            <p className="text-[14px] font-normal text-[#726969]">
              All transactions are secure and encrypted.
            </p>

            <div className="bg-[#F5F5F5] p-4 mt-4 xl:-mx-4">
              <label
                htmlFor="CreditCard"
                className="flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2 text-[14px] font-bold leading-[100%]">
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
                <span
                  className="payment-logos dflex"
                  style={{ marginLeft: "auto", gap: "8px" }}
                >
                  <span className="payment-img">
                    <Image src="/images/visa.svg" alt="Visa" width={30} height={20} />
                  </span>
                  <span className="payment-img">
                    <Image src="/images/payment.svg" alt="Mastercard" width={30} height={20} />
                  </span>
                  <span className="payment-img">
                    <Image src="/images/american.svg" alt="Amex" width={30} height={20} />
                  </span>
                </span>
              </label>

              {formData.paymentMethod === "CreditCard" && (
                <div className="w-full flex flex-col gap-4 mt-4">
                  <div className="form-item">
                    <div style={cardFieldBox}>
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
                      <div style={cardFieldBox}>
                        <CardExpiryElement
                          options={{ style: stripeFieldStyle }}
                        />
                      </div>
                    </div>
                    <div className="form-item">
                      <div style={cardFieldBox}>
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
                    <input
                      type="text"
                      name="cardholderName"
                      placeholder="Name on Card"
                      value={formData.cardholderName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div className="py-2 flex items-center gap-2 text-[14px] font-medium leadaing-[20px] text-[#4f4f4f]">
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
                <div className="delivery-details py-2">
                  <div className="form-item">
                    <h5>Billing Address</h5>
                  </div>
                  <div className="form-item select-field">
                    <input
                      type="text"
                      name="billingCountry"
                      placeholder="Country"
                      value={formData.billingCountry}
                      onChange={(e) => {
                        handleChange(e);
                        onBillingAddressValid(false);
                      }}
                    />
                    {formErrors.billingCountry && (
                      <p className="error">{formErrors.billingCountry}</p>
                    )}
                  </div>
                  <div className="form-fields dflex">
                    <div className="form-item">
                      <label htmlFor="billingFirstName">First name*</label>
                      <input
                        id="billingFirstName"
                        type="text"
                        name="billingFirstName"
                        placeholder="First name"
                        value={formData.billingFirstName}
                        onChange={handleChange}
                      />
                      {formErrors.billingFirstName && (
                        <p className="error">{formErrors.billingFirstName}</p>
                      )}
                    </div>
                    <div className="form-item">
                      <label htmlFor="billingLastName">Last name*</label>
                      <input
                        id="billingLastName"
                        type="text"
                        name="billingLastName"
                        placeholder="Last name"
                        value={formData.billingLastName}
                        onChange={handleChange}
                      />
                      {formErrors.billingLastName && (
                        <p className="error">{formErrors.billingLastName}</p>
                      )}
                    </div>
                  </div>
                  <div className="form-item">
                    <label htmlFor="billingCompany">Company (optional)</label>
                    <input
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
                    <label htmlFor="billingApartment">
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      id="billingApartment"
                      type="text"
                      name="billingApartment"
                      placeholder="Apartment, suite, etc. (optional)"
                      value={formData.billingApartment}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-fields dflex">
                    <div className="form-item">
                      <label htmlFor="billingCity">City*</label>
                      <input
                        id="billingCity"
                        type="text"
                        name="billingCity"
                        placeholder="City"
                        value={formData.billingCity}
                        onChange={(e) => {
                          handleChange(e);
                          onBillingAddressValid(false);
                        }}
                      />
                      {formErrors.billingCity && (
                        <p className="error">{formErrors.billingCity}</p>
                      )}
                    </div>
                    <div className="form-item select-field">
                      <label htmlFor="billingState">State*</label>
                      <input
                        id="billingState"
                        type="text"
                        name="billingState"
                        placeholder="State"
                        value={formData.billingState}
                        onChange={(e) => {
                          handleChange(e);
                          onBillingAddressValid(false);
                        }}
                      />
                      {formErrors.billingState && (
                        <p className="error">{formErrors.billingState}</p>
                      )}
                    </div>
                    <div className="form-item">
                      <label htmlFor="billingPostcode">Postcode*</label>
                      <input
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
                      />
                      {formErrors.billingPostcode && (
                        <p className="error">{formErrors.billingPostcode}</p>
                      )}
                    </div>
                  </div>
                  <div className="form-item">
                    <label htmlFor="billingPhone">Phone*</label>
                    <input
                      id="billingPhone"
                      type="tel"
                      name="billingPhone"
                      placeholder="Phone"
                      value={formData.billingPhone}
                      onChange={handlePhoneChange}
                      maxLength={12}
                    />

                    {formErrors.billingPhone && (
                      <p className="error">{formErrors.billingPhone}</p>
                    )}
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
                    className="w-[12px] h-[12px] accent-[#01295F] text-[#B7BAB4]"
                  />
                  <label
                    htmlFor="paypal"
                    className="font-semibold text-[14px] leading-[100%] text-black"
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
                    className="w-[12px] h-[12px] accent-[#01295F] text-[#B7BAB4]"
                  />
                  <label
                    htmlFor="afterpay"
                    className="font-semibold text-[14px] leading-[100%] text-black"
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
                    className="w-[12px] h-[12px] accent-[#01295F] text-[#B7BAB4]"
                  />
                  <label
                    htmlFor="zip"
                    className="font-semibold text-[14px] leading-[100%] text-black"
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
          className="btn btn-red btn-filled btn-sharp w-full"
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
