import Link from "next/link";
import '../../styles/contact-banner.css'

export default function ContactBanner() {
  return (
    <div className="contact-bg">
      <div className="px-6 md:px-8 xl:px-10">
        <div className="relative z-[2] flex flex-col gap-6">
          <h3>Contact Customer Care</h3>
          <p style={{ padding: "0",fontSize: "clamp(16px, 2.5vw, 20px)", }}>
            Get in contact with our Customer Care Team via your customer dashboard.
          </p>
          <Link href="/contact"
            style={{
              backgroundColor: "#FD151B", color: "white", borderRadius: "100px", height: "48px", width: "220px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 600, textAlign: "center", textDecoration: "none",
            }}
          >
            Contact Customer Care
          </Link>
        </div>
      </div>
    </div>
  );
}
