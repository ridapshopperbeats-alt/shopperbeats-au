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
          // Next 16's `priority` only emits the preload; without this the LCP
          // image competes flat against the eight other preloaded images.
          fetchPriority="high"
          // The container is full-bleed, so without this Next falls back to the
          // 1900px `width` and ships a 3840w render to phones.
          sizes="100vw"
          className="w-full h-full object-cover my-6"
        />
      </div>
    </div>
  );
}
