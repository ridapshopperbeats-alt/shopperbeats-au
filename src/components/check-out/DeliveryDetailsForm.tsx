"use client";
import React from "react";
import { Input } from "@/components/common/input";
import AddressAutocomplete from "../common/AddressAutocomplete";
import { CheckoutFormData } from "@/types/order";
import { DeliveryDetailsFormProps } from "@/types/checkout";

const DeliveryDetailsForm: React.FC<DeliveryDetailsFormProps> = ({
  formData,
  formErrors,
  handleChange,
  handlePhoneChange,
  setFormData,
  setFormErrors,
  useSavedAddress,
  setUseSavedAddress,
  savedAddresses,
  selectedAddressId,
  setSelectedAddressId,
  onShippingAddressValid,
  setSelectedAddressData,
  isAuthenticated,
}) => {
  return (
    <div className="delivery-section">
      <div className="delivery-card-box">
        <div className="delivery-details ">
          <div className="mb-5 delivery-option-row">
            <label className="flex items-center gap-2 font-bold fluid-text-12-16 leading-[20px] text-black">
              <input
                type="radio"
                name="deliveryOption"
                checked={!useSavedAddress}
                onChange={() => {
                  setUseSavedAddress(false);
                  setSelectedAddressId(null);
                  onShippingAddressValid(false);
                }}
                className="!w-[18px] !h-[18px] !scale-100 accent-[#01295F] cursor-pointer"
              />
              Add New Delivery
            </label>
            {isAuthenticated && (
              <label
                className="flex items-center gap-2 font-bold fluid-text-xs leading-[20px] text-black"
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
                  className="!w-[18px] !h-[18px] !scale-100 accent-[#01295F] cursor-pointer"
                />
                Use Saved Address
              </label>
            )}
          </div>
          {isAuthenticated && useSavedAddress && (
            <div className="saved-address-list">
              {savedAddresses.map((addr) => {
                const id = addr.id;
                if (id == null) return null;

                return (
                  <label
                    key={id}
                    className={`saved-address-item ${
                      selectedAddressId === id ? "active" : ""
                    }`}
                  >
                    <div className="saved-address-header">
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === id}
                        onChange={() => setSelectedAddressId(id)}
                        className="saved-address-radio"
                      />
                      <strong className="saved-address-title">{addr.title}</strong>
                    </div>

                    <div className="saved-address-detail">
                      <p>{addr.address}</p>
                      {addr.city}, {addr.state} {addr.pincode}
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          <div className="form-item">
            <Input
              type="text"
              name="country"
              placeholder="Country / Region"
              value={formData.country}
              onChange={(e) => {
                handleChange(e);
                onShippingAddressValid(false);
              }}
              error={formErrors.country}
            />
          </div>

          <div className="form-fields dflex">
            <div className="form-item">
              <label htmlFor="firstName" className="sr-only">
                First name*
              </label>
              <Input
                id="firstName"
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                error={formErrors.firstName}
              />
            </div>
            <div className="form-item">
              <label htmlFor="lastName" className="sr-only">
                Last name*
              </label>
              <Input
                id="lastName"
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                error={formErrors.lastName}
              />
            </div>
          </div>

          <div className="form-item">
            <label htmlFor="company" className="sr-only">
              Company (optional)
            </label>
            <Input
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
                <Input
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
            <Input
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
              <Input
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
                error={formErrors.city}
              />
            </div>
            <div className="form-item select-field">
              <label htmlFor="state" className="sr-only">
                State*
              </label>
              <Input
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
                error={formErrors.state}
              />
            </div>
          </div>

          <div className="form-item">
            <label htmlFor="postcode" className="sr-only">
              Postcode*
            </label>
            <Input
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
              error={formErrors.postcode}
            />
          </div>

          <div className="form-item">
            <label htmlFor="phone" className="sr-only">
              Phone*
            </label>
            <Input
              id="phone"
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              maxLength={12}
              required
              error={formErrors.phone}
            />

            <label className="delivery-checkbox-label">
              <input type="checkbox" /> Keep me up to date on news and exclusive offers via email and text messages
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailsForm;
