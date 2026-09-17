import Image from "next/image";
import Link from "next/link";

const images = [
  {
    img: "/images/room-heater-banner.jpg",
    link: "category/heaters",
  },
  {
    img: "/images/bedding_banner.jpg",
    link: "/category/furniture",
  },
  {
    img: "/images/beauty-banner.png",
    link: "/category/health-beauty",
  },
  {
    img: "/images/toy-games-banner.png",
    link: "/category/toys-games",
  },
  {
    img: "/images/mobile-accessories-banner.jpg",
    link: "/category/electronics",
  },
  {
    img: "/images/home-garden-banner.png",
    link: "/category/home-garden",
  },
];

export default function ImageGrid() {
  return (
    <div className="container grid grid-cols-1 md:grid-cols-2 gap-4">
      {images.map((item, index) => (
        <Link
          key={item.link}
          href={item.link}
          className="relative w-full aspect-[8/5] overflow-hidden block"
        >
          <Image
            src={item.img}
            alt={`image-${index + 1}`}
            fill
            priority={index < 2}
            className="object-cover rounded-[8px] cursor-pointer"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </Link>
      ))}
    </div>
  );
}