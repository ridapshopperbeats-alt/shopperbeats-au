import Image from "next/image";

export default function NoProductsFound({
title="No Products",
titleSpan="Found",
subTitle="Try changing filters or explore trending categories."

}) {
  return (
    <div className=" h-[350px] w-[300px] md:w-[381px] md:h-[420px]  rounded-[20px] border border-[#E5E5E5] bg-[#FAFAFA] p-4 sm:p-5 md:p-6 flex flex-col items-center text-center relative overflow-hidden mx-auto">

      <div className="relative w-full flex justify-center">
        <Image
          src="/no-product-bg.svg"
          alt="No Products"
          width={282}
          height={256}
          className="object-contain opacity-40"
        />

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="w-[160px] h-[160px]  md:w-[282px] md:h-[256px]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 mt-0 md:mt-10">
        <h2 className="text-[20px] font-bold text-[#0B2B6F]">
          {title} <span className="text-[#FF2E2E]">{titleSpan}</span>
        </h2>

        <p className="mt-3 text-[14px] font-normal text-[#A0A0A0] px-2">
          {subTitle}
        </p>
      </div>
    </div>
  );
}