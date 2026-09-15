import { SITE_URL } from "@/lib/utils/main-utils";
import type { MetadataRoute } from "next";

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