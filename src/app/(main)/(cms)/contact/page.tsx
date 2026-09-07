"use client";

import { useState } from "react";
import Image from "next/image";
import "../../../../styles/contact.css";
import Banner from "@/components/common/Banner";
import Button from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select";
import { toast } from "react-toastify";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { contactInfoSchema } from "@/lib/validations/form-schemas";
import { Phone, Mail, MessageCircle, Send } from "lucide-react";

// interface ContactCardProps {
//   icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
//   title: string;
//   highlight: string;
//   subtitle: string;
// }

// Hide for the future, as per the design, we are not showing the contact cards for now. If needed in future, we can uncomment this component and use it.
// const ContactCard = ({ icon: Icon, title, highlight, subtitle }: ContactCardProps) => (
//   <Card className="w-full h-[100.75px] flex-row items-start gap-4 rounded-2xl p-5 !shadow-[0_2px_10px_0_rgba(0,0,0,0.04)]">
//     <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#fff0f0] text-[var(--secondary)]">
//       <Icon size={17} strokeWidth={1.5} />
//     </div>
//     <div>
//       <h4 className="m-0 mb-1 font-montserrat text-sm font-bold leading-[19.5px] text-[#211E22]">
//         {title}
//       </h4>
//       <p className="m-0 mb-1 font-montserrat text-[13px] font-bold leading-[18px] text-[var(--secondary)]">
//         {highlight}
//       </p>
//       <p className="m-0 font-montserrat text-xs font-normal leading-[16.5px] text-[#99A1AF]">
//         {subtitle}
//       </p>
//     </div>
//   </Card>
// );

export default function ContactPage() {
  const {
    formData,
    formErrors,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
    setFormErrors,
  } = useFormValidation(contactInfoSchema, {
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting] = useState(false);

  const handleSubjectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }));
    if (formErrors.subject) {
      setFormErrors((prev) => ({ ...prev, subject: null }));
    }
  };

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
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };


  return (
    <>
      <div className="flex w-full flex-col items-start gap-3 self-stretch border-b border-[#E5E7EB] bg-gradient-to-b from-[#FFF7F3] to-[#FFFDFC] px-5 py-9 lg:hidden">
        <h1 className="font-montserrat text-[24px] font-bold leading-tight text-[#01295F]">
          Contact Us
        </h1>
        <p className="font-montserrat text-[14px] font-medium text-[#6A7282]">
          We&apos;re here to help — reach out any time.
        </p>
      </div>
      <Banner
        title="Contact Us"
        subtitle="We're here to help — reach out any time."
        titleClassName="font-montserrat text-[32px]! font-semibold! leading-[24px]! text-[#01295F]!"
        subtitleClassName="font-montserrat text-[16px]! font-semibold! leading-[19.5px]! text-[#6A7282]!"
        image={
          <Image
            src="/images/Group 1261155781.png"
            alt="Contact Us Banner"
            width={1920}
            height={218}
            priority
            fetchPriority="high"
          />
        }
      />

      <div className="container">
        <div className="pt-10 font-montserrat">
          {/* Hide for showing future */}
          {/* <div className="mx-auto mb-[22px] grid w-full max-w-[1118px] grid-cols-2 gap-5 max-[992px]:grid-cols-1"> */}
            {/* <ContactCard
              icon={Phone}
              title="Call Us"
              highlight="1800-123-4567"
              subtitle="Mon-Sat, 9 AM - 7 PM IST"
            /> */}
            {/* <ContactCard
              icon={Mail}
              title="Email Us"
              highlight="support@shopperbeats.com"
              subtitle="Response within 24 hours"
            /> */}
            {/* <ContactCard
              icon={MessageCircle}
              title="Live Chat"
              highlight="Chat with an agent"
              subtitle="Mon-Sat, 9 AM - 9 PM IST"
            /> */}
          {/* </div> */}

          <Card className="mx-auto mb-[22px] w-full max-w-[1118px] min-h-[488.25px] rounded-[16px] p-[35px] !shadow-[0_2px_16px_0_rgba(0,0,0,0.05)] max-[600px]:p-[25px]">
            <div className="-mx-[35px] mb-5 w-full border-b border-gray-100 px-[35px] pb-5 max-[600px]:-mx-[25px] max-[600px]:px-[25px]">
              <h3 className="m-0 mb-1 font-montserrat text-sm font-bold leading-[21px] text-[#211E22]">
                Send us a Message
              </h3>
              <p className="m-0 font-montserrat text-xs font-normal leading-[18px] text-[#99A1AF]">
                Fill out the form and we&apos;ll get back to you shortly.
              </p>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
              <div className="mb-5 grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
                <div>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    label="Full Name"
                    labelClassName="font-montserrat text-xs font-semibold leading-[17.25px] text-[#4A5565] mb-2"
                    className="mx-auto w-[526px]! h-[40.75px]! flex-col! justify-center! items-start! px-3.5! py-2.5! rounded-[10px]! border-[#E5E7EB]!"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    error={formErrors.name}
                  />
                </div>
                <div>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    label="Email Address"
                    labelClassName="font-montserrat text-xs font-semibold leading-[17.25px] text-[#4A5565] mb-2"
                    className="mx-auto w-[526px]! h-[40.75px]! flex-col! justify-center! items-start! px-3.5! py-2.5! rounded-[10px]! border-[#E5E7EB]!"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    error={formErrors.email}
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="mb-2 block font-montserrat text-xs font-semibold leading-[17.25px] text-[#4A5565]">
                  Subject
                </label>
                <Select
                  value={formData.subject || undefined}
                  onValueChange={handleSubjectChange}
                >
                  <SelectTrigger className="!h-[40.75px] !w-full rounded-[10px] border-[#E5E7EB] bg-white py-[11px] pl-[15px] pr-[37px] font-montserrat text-[13px] text-[#211e22]">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="Order Issue">Order Issue</SelectItem>
                    <SelectItem value="Returns & Refunds">Returns &amp; Refunds</SelectItem>
                    <SelectItem value="Product Question">Product Question</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.subject && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.subject}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="mb-2 block font-montserrat text-xs font-semibold leading-[17.25px] text-[#4A5565]">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your issue or question in detail..."
                  className="min-h-[120px] w-full resize-y !rounded-[14px] border border-[#ececec] bg-white px-3.5 py-[11px] font-montserrat text-[13px] text-[#211e22] outline-none placeholder:font-montserrat placeholder:text-[12.5px] placeholder:font-normal placeholder:leading-[18.75px] placeholder:text-[#D1D5DC]"
                ></textarea>
                {formErrors.message && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                debounceDelay={0}
                className="flex !h-[38.75px] w-fit min-w-[171.217px] cursor-pointer items-center justify-center gap-2 whitespace-nowrap !rounded-[30px] border-none bg-[var(--secondary)] px-7 py-2.5 text-center font-montserrat text-xs font-bold leading-[18.75px] text-white shadow-[0_4px_12px_rgba(253,21,27,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={13} strokeWidth={2.5} />
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
