"use client";

import { useState, useEffect } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";

import Button from "@/components/ui/Button";
import { PersonalInfoFormData } from "@/types/auth";
import Image from "next/image";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { useGetPersonalDataQuery, useUpdatePersonalDataMutation } from "@/lib/redux/apis/auth-api";
import { toYYYYMMDD } from "@/lib/utils/date-utils";
import { handleAustralianPhoneNumberChange } from "@/lib/utils/phone-validation";

const personalInfoSchema = yup.object().shape({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  phonenumber: yup.string().required("Phone number is required"),
  date_of_birth: yup.date().nullable(),
});

export default function PersonalInformationPage() {
  const { data: personalData, isLoading, isError } = useGetPersonalDataQuery();
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

  const [originalData, setOriginalData] = useState<PersonalInfoFormData>({
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOriginalData({
        first_name: personalData.response.first_name || "",
        last_name: personalData.response.last_name || "",
        email: personalData.response.email || "",
        phonenumber: personalData.response.phonenumber || "",
        date_of_birth: personalData.response.date_of_birth || "", 
      });
      if (personalData.response.profile_image) {
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
      setOriginalData(data);

      toast.success("Profile updated successfully!");
    } catch (error) {
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

  const handleFormError = () => {
    toast.error("Please fix the errors before submitting.");
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
          <div className="profile-img mb-2" style={{
            marginBottom: "40px"
          }}>
            <Image src={imagePreview} alt="Profile" width={200} height={200} loading="lazy" className="avatar" />
            <label htmlFor="profile_image" className="edit-icon" style={{ cursor: "pointer" }}>
              <Image src="/images/profile/edit.svg" alt="Edit Profile" width={24} height={24} loading="lazy" />
            </label>
            <input


              type="file"
              id="profile_image"
              name="profile_image"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="form-fields">
              <div className="form-item">
                <label htmlFor="first_name">First Name*</label>
                <input
                  id="first_name"
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  className="rounded-[32px]"
                  value={formData.first_name}
                  onChange={handleChange}
                />
                {formErrors.first_name && (
                  <p className="error">{formErrors.first_name}</p>
                )}
              </div>

              <div className="form-item">
                <label htmlFor="last_name">Last Name*</label>
                <input
                  id="last_name"
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  className="rounded-[32px]"
                  value={formData.last_name}
                  onChange={handleChange}
                />
                {formErrors.last_name && (
                  <p className="error">{formErrors.last_name}</p>
                )}
              </div>
            </div>

            <div className="form-item">
              <label htmlFor="email">Email*</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter Email"
                value={formData.email}
                disabled
              />
            </div>

            <div className="form-item">
              <label htmlFor="phonenumber">Phone Number*</label>
              <input
                id="phonenumber"
                type="tel"
                name="phonenumber"
                placeholder="e.g. 0412345678 or +61412345678"
                value={formData.phonenumber}
                onChange={handlePhoneChange}
                inputMode="numeric"
                pattern="[0-9+]*"
              />

              {formErrors.phonenumber && (
                <p className="error">{formErrors.phonenumber}</p>
              )}
            </div>

            <div className="form-item">
              <label htmlFor="date_of_birth">Date of Birth (Optional)</label>
              <input
                id="date_of_birth"
                type="date"
                name="date_of_birth"
                value={toYYYYMMDD(formData.date_of_birth)}
                onChange={handleChange}
                min="1900-01-01"
                max="2025-12-31"
              />
              {formErrors.date_of_birth && (
                <p className="error">{formErrors.date_of_birth}</p>
              )}
            </div>


            <div className="flex justify-center w-full">
              <Button
                type="submit"
                disabled={isUpdating}
                isLoading={isUpdating}
                className="btn btn-red btn-filled btn-sharp w-30 mt-20"
                style={{ alignItems: "center", justifyContent: "center", display: "flex", marginTop: "10px" }}
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
