"use client";

import { useState } from "react";

import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/input";
import Button from "@/components/common/Button";

export default function CardDemo() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex justify-center p-10">
      <Card width="1118px" height="499px" className="p-6 gap-6">
        <h2 className="text-lg font-semibold text-gray-900">Sample Card</h2>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="firstName"
            name="firstName"
            label="First Name"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
          />
          <Input
            id="lastName"
            name="lastName"
            label="Last Name"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <Input
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
        />

        <div className="flex w-full justify-end">
          <Button
            type="button"
            className="rounded-full bg-[#EE2C39] px-6 py-2.5 text-sm font-medium text-white"
          >
            Submit
          </Button>
        </div>
      </Card>
    </div>
  );
}
