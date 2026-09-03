"use client";

import { useState } from "react";
import Image from "next/image";
import Banner from "@/components/common/Banner";
import Button from "@/components/common/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select";
import { toast } from "react-toastify";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { intellectualPropertySchema } from "@/lib/validations/form-schemas";
import { TriangleAlert } from "lucide-react";

const CARD_CLASS =
  "w-full max-w-[1118px] rounded-2xl border border-[#F3F4F6] shadow-[0px_2px_16px_0px_#0000000D] bg-white box-border";

const CARD_HEADER_CLASS =
  "w-full p-5 md:px-6 md:py-5 border-b border-[#F3F4F6] box-border";

const complaintSteps = [
  {
    title: "Identify the Infringement",
    description:
      "Locate the specific listing URL on ShopperBeats that you believe infringes your intellectual property rights.",
  },
  {
    title: "Gather Evidence",
    description:
      "Prepare proof of ownership such as trademark registration number, copyright registration, or patent number.",
  },
  {
    title: "Submit Your Complaint",
    description:
      "Complete the form below with all required details. Our IP team reviews complaints within 2 business days.",
  },
  {
    title: "Review & Action",
    description:
      "If your complaint is valid, we will remove the infringing listing and notify the seller. You will receive a confirmation email.",
  },
];

const ipTypeOptions = ["Copyright", "Trademark", "Patent", "Trade Secret", "Other"];

interface IpComplaintForm {
  fullName: string;
  email: string;
  companyName: string;
  country: string;
  ipType: string;
  listingUrls: string;
  description: string;
  proofOfOwnership: string;
  declaration: boolean;
}

export default function IntellectualPropertyComplaintsPage() {
  const {
    formData,
    formErrors,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
    setFormErrors,
  } = useFormValidation<IpComplaintForm>(intellectualPropertySchema, {
    fullName: "",
    email: "",
    companyName: "",
    country: "",
    ipType: "",
    listingUrls: "",
    description: "",
    proofOfOwnership: "",
    declaration: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIpTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, ipType: value }));
    if (formErrors.ipType) {
      setFormErrors((prev) => ({ ...prev, ipType: null }));
    }
  };

  const handleFormSubmit = async (data: IpComplaintForm) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/intellectual-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to submit complaint");
      }

      toast.success("Your complaint has been submitted. Our IP team will review it shortly.");
      resetForm();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit complaint. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex w-full flex-col items-start gap-3 self-stretch border-b border-[#E5E7EB] bg-gradient-to-b from-[#FFF7F3] to-[#FFFDFC] px-5 py-9 lg:hidden">
        <h1 className="font-montserrat text-[24px] font-bold leading-tight text-[#01295F]">
          Intellectual Property
        </h1>
        <p className="font-montserrat text-[14px] font-medium text-[#6A7282]">
          Report copyright or trademark infringement.
        </p>
      </div>
      <Banner
        title="Intellectual Property"
        subtitle="Report copyright or trademark infringement."
        titleClassName="font-montserrat text-[32px]! font-semibold! leading-[24px]! text-[#01295F]!"
        subtitleClassName="font-montserrat text-[16px]! font-semibold! leading-[19.5px]! text-[#6A7282]!"
        image={
          <Image
            src="/images/Group 1261155781.png"
            alt="Intellectual Property Banner"
            width={1920}
            height={218}
            priority
            fetchPriority="high"
          />
        }
      />

      <div className="mx-auto my-0 md:my-10 box-border flex w-full max-w-full flex-col gap-4 p-4 md:max-w-[1118px] md:gap-5 md:p-0">
        {/* Top alert card */}
        <div
          className={`${CARD_CLASS} flex flex-col items-start gap-3.5 p-5 md:flex-row md:px-6 md:py-5`}
        >
          <div className="flex w-[40px] h-[40px] shrink-0 items-center justify-center rounded-xl bg-[#FFF0F0] box-border">
            <TriangleAlert size={18} color="#FD151B" strokeWidth={2} />
          </div>
          <div>
            <div className="font-montserrat fluid-text-xs font-bold leading-[21px] text-[#211E22]">
              Intellectual Property Complaints
            </div>
            <div className="mt-1 font-montserrat text-12px font-normal leading-[20px] text-[#6A7282]">
              ShopperBeats respects intellectual property rights and expects our sellers to do
              the same. If you believe a listing infringes your copyright, trademark, or other
              intellectual property rights, please use this page to submit a formal complaint.
            </div>
          </div>
        </div>

        {/* Complaint Process */}
        <div className={`${CARD_CLASS} overflow-hidden`}>
          <div className={CARD_HEADER_CLASS}>
            <div className="font-montserrat fluid-text-xs font-bold leading-[21px] text-[#211E22]">
              Complaint Process
            </div>
            <div className="mt-0.5 font-montserrat text-12px font-normal leading-[16.5px] text-[#99A1AF]">
              What happens after you submit
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:gap-x-8 md:gap-y-5 md:p-6 box-border">
            {complaintSteps.map((step, index) => (
              <div
                key={step.title}
                className="flex flex-col items-start gap-2.5 md:flex-row md:gap-3"
              >
                <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#FD151B] box-border">
                  <span className="font-montserrat text-12px font-extrabold leading-[18px] text-white">
                    {index + 1}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="font-montserrat text-12px font-bold leading-[18px] text-[#211E22]">
                    {step.title}
                  </div>
                  <div className="font-montserrat text-12px font-normal leading-[19px] text-[#99A1AF]">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit a Complaint */}
        <div className={`${CARD_CLASS} overflow-hidden`}>
          <div className={CARD_HEADER_CLASS}>
            <div className="font-montserrat fluid-text-xs font-bold leading-[19.5px] text-[#211E22]">
              Submit a Complaint
            </div>
            <div className="mt-0.5 font-montserrat text-12px font-normal leading-[16.5px] text-[#99A1AF]">
              All fields marked * are required
            </div>
          </div>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="flex flex-col gap-[18px] p-4 md:p-6 box-border"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-12px font-medium leading-[16.5px] text-[#090909]">
                  Your Full Name <span className="text-[#FD151B]">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="box-border h-[38px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 font-montserrat text-xs text-[#111827] outline-none"
                />
                {formErrors.fullName && (
                  <p className="text-xs text-[#FD151B]">{formErrors.fullName}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-12px font-medium leading-[16.5px] text-[#090909]">
                  Email Address <span className="text-[#FD151B]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="box-border h-[38px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 font-montserrat text-xs text-[#111827] outline-none"
                />
                {formErrors.email && (
                  <p className="text-xs text-[#FD151B]">{formErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-12px font-medium leading-[16.5px] text-[#090909]">
                  Company / Brand Name <span className="text-[#FD151B]">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="box-border h-[38px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 font-montserrat text-xs text-[#111827] outline-none"
                />
                {formErrors.companyName && (
                  <p className="text-xs text-[#FD151B]">{formErrors.companyName}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-12px font-medium leading-[16.5px] text-[#090909]">
                  Country <span className="text-[#FD151B]">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="box-border h-[38px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 font-montserrat text-xs text-[#111827] outline-none"
                />
                {formErrors.country && (
                  <p className="text-xs text-[#FD151B]">{formErrors.country}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-montserrat text-12px font-medium leading-[16.5px] text-[#090909]">
                Type of IP Right <span className="text-[#FD151B]">*</span>
              </label>
              <Select value={formData.ipType || undefined} onValueChange={handleIpTypeChange}>
                <SelectTrigger className="!h-[38px] !w-full rounded-lg border-[#E5E7EB] bg-white px-3.5 font-montserrat text-12px text-[#364153]">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {ipTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.ipType && (
                <p className="text-xs text-[#FD151B]">{formErrors.ipType}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-montserrat text-12px font-medium leading-[16.5px] text-[#090909]">
                Infringing Listing URL(s) <span className="text-[#FD151B]">*</span>
              </label>
              <textarea
                name="listingUrls"
                rows={2}
                value={formData.listingUrls}
                onChange={handleChange}
                placeholder="https://shopperbeats.com/product/.."
                className="box-border w-full resize-y rounded-[10px] border border-[#E5E7EB] bg-white px-3.5 py-2.5 font-montserrat text-12px font-normal text-[#364153] outline-none"
              />
              {formErrors.listingUrls && (
                <p className="text-xs text-[#FD151B]">{formErrors.listingUrls}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-montserrat text-12px font-medium leading-[16.5px] text-[#090909]">
                Description of Infringement <span className="text-[#FD151B]">*</span>
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe how this listing infringes your intellectual property..."
                className="box-border w-full resize-y rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 font-montserrat text-12px text-[#364153] outline-none"
              />
              {formErrors.description && (
                <p className="text-xs text-[#FD151B]">{formErrors.description}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-montserrat text-12px font-medium leading-[16.5px] text-[#090909]">
                Proof of Ownership{" "}
                <span className="font-normal text-[#99A1AF]">(Optional)</span>
              </label>
              <div className="font-montserrat text-[11px] font-normal leading-4 text-[#99A1AF]">
                Trademark registration number, copyright registration, or other evidence
              </div>
              <input
                type="text"
                name="proofOfOwnership"
                value={formData.proofOfOwnership}
                onChange={handleChange}
                placeholder="e.g. TM Reg. No. 12345678"
                className="box-border h-[38px] w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 font-montserrat text-12px text-[#364153] outline-none"
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="declaration"
                checked={formData.declaration}
                onChange={handleChange}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#FD151B]"
              />
              <label className="font-montserrat text-12px font-medium leading-[16.5px] text-[#6A7282]">
                I declare that the information in this complaint is accurate and that I am the
                rights owner or authorised to act on behalf of the rights owner.
              </label>
            </div>
            {formErrors.declaration && (
              <p className="-mt-3 text-12px text-[#FD151B]">{formErrors.declaration}</p>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                debounceDelay={0}
                className="flex h-[39.5px] w-full min-w-[187.85px] cursor-pointer items-center justify-center whitespace-nowrap !rounded-[30px] border-none bg-[#FD151B] px-8 font-montserrat text-12px font-bold leading-[19px] text-white disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer help bar */}
        {/* <div
          className={`${CARD_CLASS} flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center md:gap-0 md:px-6`}
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0F0]">
              <Mail size={18} color="#FD151B" strokeWidth={2} />
            </div>
            <div>
              <div className="font-montserrat fluid-text-xs font-bold leading-[19.5px] text-[#211E22]">
                Need help with your complaint?
              </div>
              <div className="mt-0.5 font-montserrat text-12px font-normal leading-[16.5px] text-[#99A1AF]">
                Contact our IP team at ip@shopperbeats.com.au
              </div>
            </div>
          </div>
          <a
            href="mailto:ip@shopperbeats.com.au"
            className="flex w-full items-center justify-center gap-2 rounded-[30px] bg-[#FD151B] px-6 py-2.5 font-montserrat text-12px font-bold leading-[19px] text-white no-underline box-border md:w-auto"
          >
            <Mail size={14} color="#FFFFFF" strokeWidth={2} />
            Email Us
          </a>
        </div> */}
      </div>
    </>
  );
}
