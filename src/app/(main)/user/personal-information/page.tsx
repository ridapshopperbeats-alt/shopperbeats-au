"use client";

import { useState, useEffect } from "react";
import * as yup from "yup";
import { useSelector } from "react-redux";

import { applyImageVariant } from "@/lib/utils/imageUtils";
import Image from "next/image";
import { dateOfBirth, email, nameField, phoneNumber } from "@/lib/validations/form-schemas";
import { useGetPersonalDataQuery, useUpdatePersonalDataMutation } from "@/lib/redux/apis/auth-api";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { PersonalInfoFormData } from "@/types/auth";
import { RootState } from "@/lib/redux/store";
import { handleAustralianPhoneNumberChange, handleUSPhoneNumberChange, toYYYYMMDD } from "@/lib/utils/main-utils";
import { toast } from "react-toastify";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/input";
import { Card } from "@/components/common/Card";
import { CameraIcon } from "@/components/common/Svg";

const personalInfoSchema = yup.object().shape({
  first_name: nameField("First Name"),
  last_name: nameField("Last Name"),
  email: email,
  phonenumber: phoneNumber,
  date_of_birth: dateOfBirth,
});
function resolveProfileImage(url?: string | null): string | null {
  if (!url) return null;
  return applyImageVariant(url, "public");
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp"];
const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "svg", "gif", "webp"];

function isAllowedImageFile(file: File): boolean {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) return true;
  const extension = file.name.split(".").pop()?.toLowerCase();
  return !!extension && ALLOWED_IMAGE_EXTENSIONS.includes(extension);
}

export default function PersonalInformationPage() {
  const { isAuthenticated, authChecked } = useSelector((state: RootState) => state.auth);
  // Wait for the app's session check (getUserDetails, which also drives the
  // access-token refresh on a hard reload) to settle before firing this
  // query — otherwise it races that check, 401s with a stale/empty token,
  // and blanks the form instead of waiting for the refreshed token.
  const { data: personalData } = useGetPersonalDataQuery(undefined, {
    skip: !authChecked || !isAuthenticated,
  });
  const [updatePersonalData, { isLoading: isUpdating }] =
    useUpdatePersonalDataMutation();

  const { formData, formErrors, handleChange, handleSubmit, setFormData } =
    useFormValidation(personalInfoSchema, {
      first_name: "",
      last_name: "",
      email: "",
      phonenumber: "",
      date_of_birth: "",
    });

  const [imagePreview, setImagePreview] = useState<string>("/images/default_user_icon.jpg");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const [, setOriginalData] = useState<PersonalInfoFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phonenumber: "",
    date_of_birth: "",
  });

  useEffect(() => {
    if (personalData && personalData.response) {
      setFormData({
        first_name: personalData.response.first_name || "",
        last_name: personalData.response.last_name || "",
        email: personalData.response.email || "",
        phonenumber: personalData.response.phonenumber || "",
        date_of_birth: personalData.response.date_of_birth || "",
      });
      setOriginalData({
        first_name: personalData.response.first_name || "",
        last_name: personalData.response.last_name || "",
        email: personalData.response.email || "",
        phonenumber: personalData.response.phonenumber || "",
        date_of_birth: personalData.response.date_of_birth || "",
      });
      if (personalData.response.profile_image) {
        setImagePreview(applyImageVariant(personalData.response.profile_image, "public"));
      }
    }
  }, [personalData, setFormData]);

  const handleFormSubmit = async (data: PersonalInfoFormData) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("first_name", data.first_name);
      formDataToSend.append("last_name", data.last_name);
      formDataToSend.append("email", data.email);
      formDataToSend.append("phonenumber", data.phonenumber);

      if (data.date_of_birth) {
        formDataToSend.append("date_of_birth", toYYYYMMDD(data.date_of_birth));
      }

      if (profileImage) {
        formDataToSend.append("profile_image", profileImage);
      }

      await updatePersonalData(formDataToSend).unwrap();
      setOriginalData(data);

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed, status:", (error as { status?: number | string })?.status);
      toast.error("Failed to update profile.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAllowedImageFile(file)) {
      toast.error("Only JPG, JPEG, PNG, SVG, GIF, and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value, error } = handleUSPhoneNumberChange(
      e,
      formData.phonenumber
    );

    setFormData((prev) => ({
      ...prev,
      phonenumber: value,
    }));

    // eslint-disable-next-line react-hooks/immutability
    formErrors.phonenumber = error;
  };

  return (
    <Card className="mx-auto w-[377px] h-auto shrink-0 border-[1.167px] p-6 gap-6 sm:w-full sm:max-w-[1118px] sm:border">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0">
          <Image
            src={imagePreview}
            alt="Profile"
            width={56}
            height={56}
            loading="lazy"
            className="h-14 w-14 rounded-full object-cover"
          />
          <label
            htmlFor="profile_image"
            className="absolute right-0 bottom-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#F3F4F6] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)]"
          >
            <CameraIcon />
          </label>
          <Input
            type="file"
            id="profile_image"
            name="profile_image"
            accept="image/jpeg,image/png,image/svg+xml,image/gif,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        <div>
          <h2 className="font-[Montserrat] text-[clamp(0.8125rem,0.8125rem,0.8125rem)] font-semibold leading-[19.5px] text-[#101828]">
            Personal Information
          </h2>
          <p className="font-[Montserrat] text-[clamp(0.6875rem,0.6875rem,0.6875rem)] font-normal leading-[16.5px] text-[#99A1AF]">
            Manage your account details below
          </p>
        </div>
      </div>

      <hr className="-mx-6 w-[calc(100%+3rem)] border-t border-[#E0E0E0]" />

      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex w-full flex-col gap-4">
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Input
              id="first_name"
              label="First Name*"
              error={formErrors.first_name}
              type="text"
              name="first_name"
              placeholder="First name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Input
              id="last_name"
              label="Last Name*"
              error={formErrors.last_name}
              type="text"
              name="last_name"
              placeholder="Last name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Input
              id="email"
              label="Email Address*"
              type="email"
              error={formErrors.email}
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              disabled
            />
          </div>

          <div className="flex flex-col gap-1">
            <Input
              id="phonenumber"
              type="tel"
              label="Phone Number*"
              name="phonenumber"
              placeholder="e.g. 1234567890 or +11234567890"
              value={formData.phonenumber}
              onChange={handlePhoneChange}
              inputMode="numeric"
              pattern="[0-9+]*"
              error={formErrors.phonenumber}
            />
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Input
              id="date_of_birth"
              type="date"
              label="Date of Birth (Optional)"
              name="date_of_birth"
              value={toYYYYMMDD(formData.date_of_birth)}
              onChange={handleChange}
              min="1900-01-01"
              max="2025-12-31"
            />
          </div>
        </div>

        <hr className="w-full border-t-[1px] border-[#E0E0E0]" />
        <div className="flex w-full justify-end">
          <Button
            type="submit"
            disabled={isUpdating}
            isLoading={isUpdating}
            className="flex items-center justify-center rounded-[30px]! bg-sb-red px-6 py-2.5 text-center font-montserrat text-[clamp(0.8125rem,0.8125rem,0.8125rem)] font-bold leading-[19.5px] text-white disabled:opacity-50"
            debounceDelay={500}
          >
            {isUpdating ? "Saving..." : "Update Information"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
