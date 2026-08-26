import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import * as yup from "yup";
import { getClientIp, isRateLimited } from "@/lib/utils/rate-limit";
import { nameField, requiredMessage } from "@/lib/validations/form-schemas";

export const phoneNumber = yup
  .string()
  .required("Phone number is required")
  .matches(
    /^(?:\+?61\s?|0)4\d{8}$/,
    "Enter a valid Australian mobile number (e.g. 0412345678 or +61412345678)"

  );

/* ------------------ EMAIL ------------------ */

export const email = yup .string()
  .email("Invalid email")
  .required("Email is required")
  .matches(/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/, "Email must contain a valid domain")


sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const contactSchema = yup.object().shape({
  name: nameField("Name"),
  email: email,
  // phone: phoneNumber,
  message: requiredMessage("Message", 5),
});

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);

  if (isRateLimited(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { name, email, message } = await contactSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const msg = {
      to: "cs@shopperbeats.com.au",
      from: "noreply@shopperbeats.com.au",
      subject: "New Contact Form Submission",
      html: `
        <h2>New Contact Request</h2>
        <p><b>Name:</b> ${escapeHtml(name)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        <p><b>Message:</b> ${escapeHtml(message)}</p>
      `,
    };

    const data = await sgMail.send(msg);
    console.log(data,"dat===========");

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return NextResponse.json(
        { success: false, error: error.errors[0] || "Invalid input" },
        { status: 400 }
      );
    }

    console.error("[api/contact] Failed to send message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
