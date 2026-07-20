import Image from "next/image";

export default function SingleBanner() {
  return (
    <div className="container ">
      <div className="relative w-full h-full">
        <Image
          src="/images/end_of_year_sale_saving.jpg"
          alt="Banner"
          width={1900}
          height={500}
          priority
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
