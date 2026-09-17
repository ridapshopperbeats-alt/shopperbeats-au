import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import * as yup from "yup";
import { getClientIp, isRateLimited } from "@/lib/utils/rate-limit";
import { email, nameField, requiredMessage } from "@/lib/validations/form-schemas";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const contactSchema = yup.object().shape({
  name: nameField("Name"),
  email: email,
  message: requiredMessage("Message", 5),
});

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const emailTemplate = `<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ShopperBeats - Contact Form Submission</title>
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap"
  rel="stylesheet"
/>

<style>
  body{
    margin:0;
    padding:0;
    background:#f3f3f3;
    font-family:'Montserrat', Arial, Helvetica, sans-serif;
  }

  table{
    border-spacing:0;
    font-family:'Montserrat', Arial, Helvetica, sans-serif;
  }

  td,
  p,
  a,
  span,
  div,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6{
    font-family:'Montserrat', Arial, Helvetica, sans-serif;
  }

  img{
    border:0;
    display:block;
  }

  @media only screen and (max-width:600px){

    .container{
      width:100% !important;
    }

    .mobile-padding{
      padding-left:20px !important;
      padding-right:20px !important;
    }

    .button{
      width:100% !important;
      display:block !important;
      box-sizing:border-box;
    }

    .hero-title{
      font-size:24px !important;
      line-height:23px !important;
    }

    .hero-subtitle{
      font-size:20px !important;
    }

  }
</style>

</head>

<body>

<!-- OUTER WRAPPER -->
<table width="100%" bgcolor="#f3f3f3" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<!-- MAIN CONTAINER -->
<table width="600" cellpadding="0" cellspacing="0" class="container"
style="width:600px; background:#ffffff;">

  <!-- TOP BAR -->

  <tr>
    <td style="height:18px; background:#032b6b;"></td>
  </tr>

  <!-- LOGO -->

  <tr>
    <td align="center" style="padding:10px; background:#ffffff;">
  <img
   src="https://imagedelivery.net/-qVhXOLIjYt55ekpqpituQ/befd55f3-50d7-4a07-f5b5-94a800000000/public"
    alt="ShopperBeats"
    width="221"
    height="45"
    style="display:block; border:0;"
  />

</td>


  </tr>

  <!-- HERO SECTION -->

  <tr>
    <td align="center"
      style="
      background:#032b6b;
      padding:28px 20px 30px 20px;
      border-bottom-left-radius:50% 28px;
      border-bottom-right-radius:50% 28px;
      ">

  <div
    style="
    color:#ffffff;
    font-size:24px;
    line-height:23px;
    font-weight:900;
    ">
    New Contact Form
  </div>

  <div
    style="
    color:#ffffff;
    font-size:24px;
    margin-top:8px;
    font-weight:400;
    ">
    Submission Received
  </div>

  <!-- FEATURES -->
  <table cellpadding="0" cellspacing="0" align="center"
  style="margin-top:24px;">
    <tr>
      <td align="center">

        <img
           src="https://imagedelivery.net/-qVhXOLIjYt55ekpqpituQ/f6fda5ed-2301-4a49-8c64-5e5e74165800/public"
          alt="Features"
          width="447"
          height="24"
          style="
          display:block;
          border:0;
          max-width:420px;
          width:100%;
          "
        />

      </td>
    </tr>
  </table>

</td>


  </tr>

  <!-- MAIN CONTENT -->

  <tr>
    <td
      class="mobile-padding"
      style="
      padding:47px 40px 39px 40px;
      color:#333333;
      vertical-align:top;
      "
    >


  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
  >

    <!-- TOP CONTENT -->
    <tr>
      <td valign="top">

        <h2 style="
        margin:0;
        font-size:16px;
        line-height:22px;
        font-weight:600;
        color:#111111;
        ">
          New Contact Form Submission
        </h2>

        <p style="
        margin-top:20px;
        font-size:12px;
        font-weight:400;
        line-height:22px;
        color:#9A9A9A;
        ">
          A new message has been submitted through the ShopperBeats contact form. Details are below.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
          <tr>
            <td style="padding:6px 0; font-size:12px; font-weight:600; color:#111111; width:170px; vertical-align:top;">Name</td>
            <td style="padding:6px 0; font-size:12px; color:#333333; vertical-align:top;">{{ name }}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; font-size:12px; font-weight:600; color:#111111; vertical-align:top;">Email</td>
            <td style="padding:6px 0; font-size:12px; color:#333333; vertical-align:top;">{{ email }}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; font-size:12px; font-weight:600; color:#111111; vertical-align:top;">Message</td>
            <td style="padding:6px 0; font-size:12px; color:#333333; vertical-align:top; white-space:pre-wrap;">{{ message }}</td>
          </tr>
        </table>

        <p style="
        margin-top:24px;
        font-size:12px;
        line-height:20px;
        color:#111111;
        ">
          Thanks,<br>
          <strong>The ShopperBeats Team</strong>
        </p>

      </td>
    </tr>

    <!-- BOTTOM TEXT -->
    <tr>
      <td valign="bottom">

        <p style="
        margin:20px 0 0;
        font-weight:400;
        font-size:12px;
        line-height:18px;
        color:#9A9A9A;
        ">
          This is an automated notification from the ShopperBeats contact form.
        </p>

      </td>
    </tr>

  </table>

</td>


  </tr>

  <!-- FOOTER -->

  <tr>
    <td
    align="center"
    style="
    background:#032b6b;
    height:104px;
    padding-top:10px;
    ">


  <div style="
  color:#ffffff;
  font-size:22px;
  font-weight:700;
  ">
    Follow Us
  </div>

  <!-- SOCIAL ICONS -->
  <table cellpadding="0" cellspacing="0"
  align="center"
  style="padding-top:3px;">
    <tr>
 <td style="padding:0 6px;">
            <img src="https://imagedelivery.net/-qVhXOLIjYt55ekpqpituQ/6145e313-2330-469a-cfd4-f55a26dae500/public" width="25" height="25" alt="facebook">
          </td>

          <td style="padding:0 6px;">
            <img src="https://imagedelivery.net/-qVhXOLIjYt55ekpqpituQ/4a0c203c-5d08-4682-6b19-f804fdab3d00/public" width="25" height="25" alt="instagram">
          </td>

          <td style="padding:0 6px;">
            <img src="https://imagedelivery.net/-qVhXOLIjYt55ekpqpituQ/44453c87-2daa-494f-782d-67fdc1858100/public" width="25" height="25" alt="">
          </td>

          <td style="padding:0 6px;">
            <img src="https://imagedelivery.net/-qVhXOLIjYt55ekpqpituQ/eefd0b7a-d897-467e-257b-a65331873400/public" width="25" height="25" alt="">
          </td>

          <td style="padding:0 6px;">
            <img src="https://imagedelivery.net/-qVhXOLIjYt55ekpqpituQ/b2d92f59-94f2-45ee-f13d-199755984c00/public" width="25" height="25" alt="">
          </td>

    </tr>
  </table>

  <p style="
  color:#ffffff;
  font-size:12px;
  font-weight:400;
  padding:0 20px;
  line-height:18px;
  ">
     Bringing you the latest trends, quality products, and a seamless shopping experience every time.
  </p>

</td>


  </tr>

  <!-- COPYRIGHT -->

  <tr>
    <td
    align="center"
    style="
    background:#032b6b;
    border-top:1px solid rgba(255,255,255,0.2);
    padding:8px 10px;
    line-height:18px;
    color:#ffffff;
    font-size:12px;
    ">
    © 2026 ShopperBeats. All Rights Reserved.
    </td>
  </tr>

</table>

</td>
</tr>
</table>


</body>
</html>`;

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

    const html = emailTemplate
      .replace(/{{\s*name\s*}}/g, () => escapeHtml(name))
      .replace(/{{\s*email\s*}}/g, () => escapeHtml(email))
      .replace(/{{\s*message\s*}}/g, () => escapeHtml(message));

    const msg = {
      to: "cs@shopperbeats.com",
      from: "noreply@shopperbeats.com.au",
      subject: "New Contact Form Submission",
      html,
    };

    await sgMail.send(msg);

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
