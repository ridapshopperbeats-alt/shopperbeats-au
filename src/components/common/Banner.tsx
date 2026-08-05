import { cn } from "@/lib/utils";

interface BannerProps {
  title: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  image: React.ReactNode;
}

export default function Banner({ title, subtitle, titleClassName, subtitleClassName, image }: Readonly<BannerProps>) {
  return (
    <div className="mt-5 relative overflow-hidden h-[202px] flex items-center justify-center">

      <div className="absolute inset-0 -z-10 mx-auto w-full h-[202px] max-w-[1934px]">
        <div className="w-full h-full [&>*]:w-full [&>*]:h-full [&>*]:object-cover">
          {image}
        </div>
      </div>

      <div className="content-inner relative z-10 px-4 sm:px-6 md:px-8 text-center">
        <h3
          className={cn(
            "text-white align-center text-[24px] sm:text-[32px] md:text-[42px] lg:text-[56px] leading-tight font-bold",
            titleClassName
          )}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className={cn(
              "mt-2 text-white/90 text-[13px] sm:text-[15px] md:text-[16px] font-medium",
              subtitleClassName
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}