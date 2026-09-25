import Image from "next/image";

export default function SingleBanner() {
  return (
    <div className="container ">
      <div className="relative w-full h-full">
        <Image
          src="/images/top_banner.png"
          alt="Banner"
          width={1900}
          height={500}
          priority
          fetchPriority="high"
          sizes="100vw"
          className="w-full h-full object-cover my-4"
        />
      </div>
    </div>
  );
}
