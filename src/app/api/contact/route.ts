import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

interface ContactRequestBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export async function POST(request: NextRequest) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.error("Contact form error: SENDGRID_API_KEY is not configured");
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 },
    );
  }

  let body: ContactRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const subject = body.subject?.trim();
  const message = body.message?.trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    );
  }

  sgMail.setApiKey(apiKey);

  const toEmail = process.env.CONTACT_FORM_TO_EMAIL || "support@shopperbeats.com";
  const fromEmail = process.env.CONTACT_FORM_FROM_EMAIL || "no-reply@shopperbeats.com";

  try {
    await sgMail.send({
      to: toEmail,
      from: fromEmail,
      replyTo: email,
      subject: `Contact Us: ${subject || "New message"} — from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        subject ? `Subject: ${subject}` : null,
        "",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
    });

    return NextResponse.json({ message: "Message sent successfully." });
  } catch (error) {
    const sgError = error as {
      message?: string;
      code?: number;
      response?: { body?: { errors?: { message: string; field?: string }[] } };
    };
    const sgMessages = sgError?.response?.body?.errors
      ?.map((e) => e.message)
      .join("; ");

    console.error(
      "Contact form error:",
      JSON.stringify(
        {
          message: sgError?.message,
          code: sgError?.code,
          sendgridErrors: sgError?.response?.body?.errors,
        },
        null,
        2,
      ),
    );

    return NextResponse.json(
      {
        error: "Failed to send message. Please try again.",
        detail: sgMessages || sgError?.message,
      },
      { status: 502 },
    );
  }
}
