import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils/site-url";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/user/",
                    "/cart",
                    "/check-out",
                    "/confirmed-order",
                    "/order-status",
                    "/login",
                    "/sign-up",
                    "/forgot-password",
                    "/verify-email",
                    "/email-verification",
                    "/accounts/",
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}