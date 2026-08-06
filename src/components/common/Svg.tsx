import { SVGProps } from "react";

export const CameraIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M9 3L7.17 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5H16.83L15 3H9Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


const ProfileInfoBanner = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div
      className="
        w-full
        max-w-[1934px]
        h-[202px]
        rounded-[15px]
        bg-[linear-gradient(99deg,_#FFF7F3_0%,_#FFFDFC_100%)]
      "
    >
      {children}
    </div>
  );
};

export default ProfileInfoBanner;

export const GradientBanner = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1920 202"
      className={`w-full max-w-[1934px] h-[202px] ${className}`}
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M1900.82 0H15.175C1.82352 0 -9 6.78289 -9 15.15V186.85C-9 195.217 1.82352 202 15.175 202H1900.82C1914.18 202 1925 195.217 1925 186.85V15.15C1925 6.78289 1914.18 0 1900.82 0Z"
        fill="url(#bannerGradient)"
      />
      <defs>
        <linearGradient
          id="bannerGradient"
          x1="-9"
          y1="0"
          x2="1076170"
          y2="1717260"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF7F3" />
          <stop offset="1" stopColor="#FFFDFC" />
        </linearGradient>
      </defs>
    </svg>
  );
};

