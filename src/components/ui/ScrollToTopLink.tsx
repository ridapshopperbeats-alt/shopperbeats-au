"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ScrollToTopLinkProps } from "@/types/ui";


export default function ScrollToTopLink({ href, children, className, ...props }: ScrollToTopLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Delay navigation slightly so the smooth scroll has time to run first
    setTimeout(() => {
      router.push(href);
    }, 100);
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}