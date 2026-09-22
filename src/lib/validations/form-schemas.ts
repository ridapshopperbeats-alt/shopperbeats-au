import * as yup from "yup";

/* ------------------ PASSWORD ------------------ */

export const strongPassword = yup
  .string()
  .required("New password is required")
  .min(8, "Password must be at least 8 characters")
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character and should be at least 8 characters"
  )

export const confirmPassword = (fieldName: string) =>
  yup
    .string()
    .oneOf([yup.ref(fieldName)], "Passwords must match")
    .required("Confirm Password is required");

export const australianPhoneNumber = yup
  .string()
  .required("Phone number is required")
  .matches(
    /^(?:\+614\d{8}|04\d{8})$/,
    "Enter a valid Australian mobile number (e.g. 0412345678 or +61412345678)"
  );

/* ------------------ EMAIL ------------------ */

export const email = yup .string()
  .email("Invalid email")
  .required("Email is required")
  .matches(/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/, "Email must contain a valid domain")

/* ------------------ COMMON TEXT ------------------ */

export const requiredString = (label: string) =>
  yup
    .string()
    .trim()
    .required(`${label} is required`);

/* ------------------ DOB  ------------------ */

export const dateOfBirth = yup
  .string()
  .nullable()
  .transform((value, originalValue) =>
    originalValue === "" ? null : value
  )
  .test(
    "not-in-future",
    "Date of Birth cannot be in the future",
    (value) => {
      if (!value) return true;
      return new Date(value) <= new Date();
    }
  );
/* ------------------ PINCODE  ------------------ */

export const pincode = yup
  .string()
  .required("Postcode is required")
  .matches(/^\d{4}$/, "Enter a valid Australian postcode");

/* ------------------ Name  ------------------ */

export const nameField = (label: string) =>
  yup
    .string()
    .trim()
    .required(`${label} is required`)
    .max(50, `${label} must be at most 50 characters`)
    .matches(/^[a-zA-Z\s]+$/, `${label} must contain only letters`);

/* ------------------ MESSAGE / NOTES ------------------ */

export const message = yup
  .string()
  .trim()
  .max(500, "Message cannot exceed 500 characters")
  .nullable();

export const requiredMessage = (label: string = "Message", min: number = 5) =>
  yup
    .string()
    .trim()
    .required(`${label} is required`)
    .min(min, `${label} must be at least ${min} characters long`)
    .max(500, `${label} cannot exceed 500 characters`);

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
  phone_number: australianPhoneNumber,
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
  date_of_birth: yup.string(),
});


export const contactFormSchema = yup.object().shape({
  name: nameField("Name"),
  email: email,
  phone: australianPhoneNumber,
  message: requiredMessage("Message", 5),
});

// src/app/api/intellectual-property/route.ts
export const ipComplaintSchema = yup.object().shape({
  fullName: nameField("Full name"),
  email: email,
  companyName: requiredString("Company / brand name"),
  country: requiredString("Country"),
  ipType: requiredString("Type of IP right"),
  listingUrls: requiredString("Infringing listing URL(s)"),
  description: requiredMessage("Description of infringement", 10),
  proofOfOwnership: yup.string(),
});
