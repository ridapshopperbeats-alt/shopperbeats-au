"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface HeaderIconProps {
  href: string;
  iconSrc: string;
  alt: string;
  className?: string;
  count?: number;
}

const HeaderIcon: React.FC<HeaderIconProps> = ({
  href,
  iconSrc,
  alt,
  className = "",
  count = 0,
}) => {
  return (
    <div className={`header-link ${className}`}>
      <Link href={href}>
        <Image src={iconSrc} alt={alt} width={20} height={20} />
      </Link>
      {count > 0 && <span className="wishlist-num">{count}</span>}
    </div>
  );
};

export default HeaderIcon;
