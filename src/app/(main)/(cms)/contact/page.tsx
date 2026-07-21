"use client";

import Image from "next/image";
import "../../../../styles/contact.css";
import Banner from "@/components/ui/Banner";

// Types
interface ContactInfoItem {
  icon: string;
  label: string;
  value: string | { weekdays: string; weekends: string };
}

interface ContactContent {
  title: string;
  description: string[];
  contactBlocks: ContactInfoItem[];
}

// JSON-like data
const contactData: ContactContent = {
  title: "Have a question, or want an update on your order?",
  description: [
    "Our team of happily helpful Experts is readily available to assist you, no matter how you choose to get in touch with us.",
    "We strive to respond promptly within 24-48 hours. During peak times, there may be a slight delay. Rest assured, we are committed to addressing your inquiries quickly.",
  ],
  contactBlocks: [
    {
      icon: "/images/cms/location.svg",
      label: "Address",
      value: "Truganina 3029, Victoria, Australia",
    },
    {
      icon: "/images/cms/clock.svg",
      label: "Working Hours",
      value: {
        weekdays: "9:00am - 5:00pm",
        weekends: "Closed",
      },
    },
  ],
};

import * as yup from "yup";

import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import { handleAustralianPhoneNumberChange } from "@/lib/utils/main-utils";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { email, nameField, phoneNumber, requiredMessage } from "@/lib/validations/form-schemas";

// Validation schema
const schema = yup.object().shape({
  name: nameField("Name"),
  email: email,
  phone: phoneNumber,
  message: requiredMessage("Message", 5),
});

export default function ContactPage() {
  const {
    formData,
    setFormData,
    formErrors,
    handleChange,
    handleSubmit,
    resetForm,
  } = useFormValidation(schema, {
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Form Submit Handler
  const handleFormSubmit = async (data: typeof formData) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to send message");
      }

      toast.success("Message sent successfully!");
      resetForm();
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  // Phone Number Handler
  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value, error } = handleAustralianPhoneNumberChange(
      e,
      formData.phone
    );

    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));

    formErrors.phone = error;
  };

  return (
    <>
      <Banner
        title="Contact Us"
        image={
          <img
            src="/images/cms/contact-banner.svg"
            alt="Contact Banner"
            className="w-full h-full object-cover"
          />
        }
      />

      <div className="contact-page py-8">
        <div className="container">
          <div className="flex dflex">

            {/* Left Section */}
            <div className="contact-wrapper">
              <h6 style={{ fontSize: "20px", fontWeight: "700" }}>
                {contactData.title}
              </h6>

              {contactData.description.map((desc, idx) => (
                <p key={idx}>{desc}</p>
              ))}

              {/* Contact Blocks */}
              <div className="contact-block">
                <h6 style={{ fontSize: "20px", fontWeight: "700" }}>
                  Headquarters{" "}
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "500",
                    }}
                  >
                    (No Showroom)
                  </span>
                </h6>

                {contactData.contactBlocks.map((block, idx) => (
                  <div key={idx} className="contact-info">
                    <Image
                      src={block.icon}
                      width={24}
                      height={24}
                      alt={block.label}
                    />

                    {typeof block.value === "string" ? (
                      <p>{block.value}</p>
                    ) : (
                      <div>
                        <p>
                          <b>Weekdays:</b>{" "}
                          <span>{block.value.weekdays}</span>
                        </p>

                        <p>
                          <b>Weekend & Public Holidays:</b>{" "}
                          <span>{block.value.weekends}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Form */}
            <form
              className="contact-form"
              onSubmit={handleSubmit(handleFormSubmit)}
            >
              <h6>Get In Touch</h6>

              <div className="form-fields">

                {/* Name */}
                <div className="form-item">
                  <label htmlFor="name">Name*</label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter Your Name"
                    value={formData.name}
                    onChange={handleChange}
                  />

                  {formErrors.name && (
                    <p className="error">{formErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="form-item">
                  <label htmlFor="email">Email*</label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter Your Email"
                    value={formData.email}
                    onChange={handleChange}
                  />

                  {formErrors.email && (
                    <p className="error">{formErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="form-item">
                <label htmlFor="phone">Phone Number*</label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="e.g. 0412345678 or +61412345678"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputMode="numeric"
                  pattern="[0-9+]*"
                />

                {formErrors.phone && (
                  <p className="error">{formErrors.phone}</p>
                )}
              </div>

              {/* Message */}
              <div className="form-item">
                <label htmlFor="message">Message*</label>

                <textarea
                  id="message"
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                />

                {formErrors.message && (
                  <p className="error">{formErrors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="btn btn-red btn-filled btn-sharp w-full"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}