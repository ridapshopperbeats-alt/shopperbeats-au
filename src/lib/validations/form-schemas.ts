import * as yup from "yup";
import {
  confirmPassword,
  creditLimit,
  currency,
  dateOfBirth,
  email,
  message,
  nameField,
  phoneNumber,
  pincode,
  requiredString,
  strongPassword,
  website,
} from "@/lib/hooks/use-yup-validation";

// Validation schemas for the login, signup, forgot password, reset password :
export const loginSchema = yup.object().shape({
  email: email,
  password: strongPassword,
});

export const signupSchema = yup.object().shape({
  first_name: nameField("First name"),
  last_name: nameField("Last name"),
  email: email,
  password: strongPassword,
  password2: confirmPassword("password"),
});

export const forgotPasswordSchema = yup.object().shape({
  email_address: email,
});

export const resetPasswordSchema = yup.object().shape({
  password1: strongPassword,
  password2: confirmPassword("password1"),
});

// src/components/pages/CheckoutPage.tsx
export const checkoutValidationSchema = yup.object({});

// Address form validation schema
export const addressSchema = yup.object().shape({
  title: yup.string().trim().required("Title is required"),
  customTitle: yup.string().when("title", (titleVal, schema) => {
    return titleVal[0] === "Others"
      ? schema.trim().required("Please enter a title")
      : schema.notRequired();
  }),
  first_name: nameField("First Name"),
  last_name: nameField("Last Name"),
  phone_number: phoneNumber,
  address: requiredString("Address"),
  city: requiredString("City"),
  state: requiredString("State"),
  pincode: pincode,
  country: requiredString("Country"),
  date_of_birth: dateOfBirth,
  is_default: yup.boolean(),
});

// Change Password validation schema
export const changePasswordValidationSchema = yup.object().shape({
  current_password: yup.string().required("Old password is required"),
  new_password: strongPassword,
  confirm_password: confirmPassword("new_password")
});

// Wishlist validation schema
export const wishListValidationSchema = yup.object().shape({
    pincode: yup.string().required("Pincode is required"),
  });
// src/components/ui/ReturnOrderPopup.tsx
export const returnMessageSchema = yup.object().shape({
  reason: yup.string().required("Return reason is required"),
  customer_comment: yup.string(),
});

// src/components/ui/ReplaceOrderPopup.tsx
export const replaceMessageSchema = yup.object().shape({
  reason: yup.string().required("Replacement reason is required"),
  customer_comment: yup.string(),
});

// src/components/ui/SellerSignupModal.tsx (step 1: account details)
export const sellerSignupStep1Schema = yup.object().shape({
  name: nameField("Name"),
  email: email,
  password: strongPassword,
  confirmPassword: confirmPassword("password"),
});

// src/components/ui/SellerSignupModal.tsx (step 2: business details)
export const sellerSignupStep2Schema = yup.object().shape({
  business_name: requiredString("Business name"),
  tax_id: requiredString("Tax ID"),
  taxIdLabel: requiredString("Tax ID label"),
  business_email: email,
  phone: phoneNumber,
  address_line1: requiredString("Address line 1"),
  address_line2: yup.string(),
  city: requiredString("City"),
  state_province: requiredString("State/Province"),
  postal_code: pincode,
  currency: currency,
  credit_limit: creditLimit,
  website: website,
  message: message,
});

// src/components/ui/CancelOrderPopup.tsx
export const cancelMessageSchema = yup.object().shape({
  reason: yup.string().required("Cancellation reason is required"),
  comment: yup.string().when("reason", (reasonVal, schema) => {
    return reasonVal[0] === "Other"
      ? schema.required("Please provide details for 'Other' reason").min(10, "Comment must be at least 10 characters long")
      : schema.notRequired();
  }),
});

// Personal Information validation schema
export const personalInfoSchema = yup.object().shape({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  phonenumber: yup.string().required("Phone number is required"),
  date_of_birth: yup.date().nullable(),
});
