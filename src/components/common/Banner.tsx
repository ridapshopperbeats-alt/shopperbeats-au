interface BannerProps {
  title: string;
  image: React.ReactNode;
}

export default function Banner({ title, image }: BannerProps) {
  return (
    <div className="mt-5 relative overflow-hidden min-h-[180px]  md:min-h-[250px] lg:min-h-[300px] flex items-center justify-center">

      <div className="absolute inset-0 -z-10 w-full h-full">
        <div className="w-full h-full [&>*]:w-full [&>*]:h-full [&>*]:object-cover">
          {image}
        </div>
      </div>

      <div className="content-inner relative z-10 px-4 sm:px-6 md:px-8 text-center">
        <h3 className="text-white align-center text-[24px] sm:text-[32px] md:text-[42px] lg:text-[56px] leading-tight font-bold">
          {title}
        </h3>
      </div>
    </div>
  );
}