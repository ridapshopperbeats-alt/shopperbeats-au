"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import Button from "@/components/common/Button";
import { PersonalInfoFormData } from "@/types/auth";
import Image from "next/image";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { useGetPersonalDataQuery, useUpdatePersonalDataMutation } from "@/lib/redux/apis/auth-api";
import { toYYYYMMDD, handleAustralianPhoneNumberChange } from "@/lib/utils/main-utils";
import { Input } from "@/components/common/input";
import { personalInfoSchema } from "@/lib/validations/form-schemas";


export default function PersonalInformationPage() {
  const { data: personalData } = useGetPersonalDataQuery();
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

  useEffect(() => {
    if (personalData && personalData.response) {
      setFormData({
        first_name: personalData.response.first_name || "",
        last_name: personalData.response.last_name || "",
        email: personalData.response.email || "",
        phonenumber: personalData.response.phonenumber || "",
        date_of_birth: personalData.response.date_of_birth || "",
      });
      if (personalData.response.profile_image) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setImagePreview(personalData.response.profile_image);
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

      await updatePersonalData(formDataToSend as any).unwrap();

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value, error } = handleAustralianPhoneNumberChange(
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
    <div>
      <div className="profile-page">
        <div className="">
          <div className="profile-img mb-10">
            <Image src={imagePreview} alt="Profile" width={200} height={200} loading="lazy" className="avatar" />
            <label htmlFor="profile_image" className="edit-icon" style={{ cursor: "pointer" }}>
              <Image src="/images/profile/edit.svg" alt="Edit Profile" width={24} height={24} loading="lazy" />
            </label>
            <Input
              type="file"
              id="profile_image"
              name="profile_image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="form-fields">
              <div className="form-item">
                <Input
                  id="first_name"
                  label="First Name*"
                  error={formErrors.first_name}
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  className="rounded-[32px]"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <Input
                  id="last_name"
                  label="Last Name*"
                  error={formErrors.last_name}
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  className="rounded-[32px]"
                  value={formData.last_name}
                  onChange={handleChange}
                />

              </div>
            </div>

            <div className="form-item">
              <Input
                id="email"
                label="Email*"
                type="email"
                error={formErrors.email}
                name="email"
                placeholder="Enter Email"
                value={formData.email}
                disabled
              />
            </div>

            <div className="form-item">
              <Input
                id="phonenumber"
                type="tel"
                label="Phone Number*"
                name="phonenumber"
                placeholder="e.g. 0412345678 or +61412345678"
                value={formData.phonenumber}
                onChange={handlePhoneChange}
                inputMode="numeric"
                pattern="[0-9+]*"
                error={formErrors.phonenumber}
              />
            </div>

            <div className="form-item">
              <Input
                id="date_of_birth"
                type="date"
                label="Date of Birth (Optional)"
                name="date_of_birth"
                value={toYYYYMMDD(formData.date_of_birth)}
                onChange={handleChange}
                min="1900-01-01"
                max="2025-12-31"
                error={formErrors.date_of_birth}
              />

            </div>


            <div className="flex justify-center w-full">
              <Button
                type="submit"
                disabled={isUpdating}
                isLoading={isUpdating}
                className="btn btn-red btn-filled btn-sharp mt-20 w-30 flex items-center justify-center mt-[10px]"
                debounceDelay={500}
              >
                {isUpdating ? "Saving..." : "Update"}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
