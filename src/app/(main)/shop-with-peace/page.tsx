import Image from "next/image";

const shopWithPeace = () => {
    return (
        <div>
            <div className="flex flex-col gap-14 md:gap-20 px-4 md:px-16 py-12">

                <section className="w-full flex justify-center">
                    <div className="w-full max-w-[1625px] flex flex-col lg:flex-row items-center lg:gap-[20px] 2xl:gap-[42px] text-left">

                        <div className="flex items-center justify-center shrink-0 w-full lg:w-auto">
                            <Image
                                src="/images/shopwith-peace1.svg"
                                alt="Shop With Confidence"
                                width={540}
                                height={380}
                                className="w-[400px] h-[300px] md:w-[450px] md:h-[350px] lg:w-[400px] lg:h-auto 2xl:w-[580px] 2xl:h-[380px] object-contain"
                            />
                        </div>

                        <div className="flex-1 max-w-[1042px] mt-6 lg:mt-0">
                            <h1 className="font-medium text-[clamp(2rem,7vw,6rem)] leading-[93%] tracking-[-4%] max-w-[722px] mx-auto lg:mx-0">
                                <span className="inline lg:block text-[#002962]">Shop with</span>
                                <span className="inline lg:block text-[#FD151B] font-extrabold pl-2 lg:pl-0">Peace of Mind</span>
                            </h1>

                            <h3 className="mt-4 lg:mt-2 text-[clamp(1.25rem,3vw,2.25rem)] font-medium text-[#002962] leading-none">
                                Shop with Confidence
                            </h3>

                            <p className="mt-2 max-w-[1024px] h-[120px] md:h-[50px] lg:h-[100px] text-[clamp(0.875rem,1.5vw,1.25rem)] leading-[30px] tracking-[-4%] font-normal text-[#161C2D]">
                                Get the item you ordered or your money back. At Shopperbeats, we want
                                every customer to shop with confidence. If your order doesn&apos;t arrive,
                                arrives damaged, or is significantly different from the description,
                                we&apos;ll work with you to resolve the issue quickly.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="w-full">
                    <div className="max-w-[1174px] mx-auto flex flex-col gap-[38px]">

                        <div className="flex flex-col-reverse lg:flex-row items-center gap-[8px] text-center lg:text-left">
                            <div className="w-full max-w-[695px] text-left">
                                <h1 className="font-montserrat font-bold text-[clamp(2rem,4vw,3rem)] leading-[1.2] tracking-[-1.8px]">
                                    <span className="text-[#002962]">Money Back </span>
                                    <span className="text-[#FD151B]">Guarantee</span>
                                </h1>

                                <h3 className="mt-3 text-[clamp(1rem,1.5vw,1.125rem)] font-normal leading-[32px] tracking-[-0.2px] text-[#161C2D] text-left">
                                    If your eligible order:
                                </h3>

                                <div className="mt-4 text-left block lg:inline-block">
                                    <ul className="list-disc pl-5 space-y-1 marker:text-[#161C2D] text-left">
                                        <li className="font-bold text-[clamp(0.9375rem,1vw,1rem)] leading-[30px] tracking-[-0.5px] text-[#161C2D]">
                                            Arrives damaged or defective
                                        </li>
                                        <li className="font-bold text-[clamp(0.9375rem,1vw,1rem)] leading-[30px] tracking-[-0.5px] text-[#161C2D]">
                                            Is significantly different from the product description
                                        </li>
                                        <li className="font-bold text-[clamp(0.9375rem,1vw,1rem)] leading-[30px] tracking-[-0.5px] text-[#161C2D]">
                                            Is missing items from your order
                                        </li>
                                    </ul>
                                </div>

                                <p className="mt-2 text-[clamp(1rem,1.5vw,1.125rem)] font-normal leading-[28px] max-w-[695px] tracking-[-0.2px] text-[#161C2D] text-left">
                                    You may be eligible for a full refund under our Money Back Guarantee policy.
                                </p>

                                <p className="mt-1 font-bold text-[clamp(1rem,1.5vw,1.125rem)] leading-[28px] tracking-[-0.2px] text-[#161C2D] text-left">
                                    Your satisfaction is our priority
                                </p>
                            </div>

                            <div className="shrink-0">
                                <Image
                                    src="/images/moneyback.png"
                                    alt="Money Back Guarantee"
                                    height={345}
                                    width={470}
                                    className="w-[280px] sm:w-[380px] lg:w-[470px] lg:h-[345px] object-contain"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
                            <div className="shrink-0">
                                <Image
                                    src="/images/ref_img1.png"
                                    alt="Easy Returns"
                                    height={496}
                                    width={449}
                                    className="w-[260px] sm:w-[350px] lg:w-[449px] h-auto object-contain"
                                />
                            </div>

                            <div className="w-full max-w-[626px] text-left">
                                <h1 className="font-bold text-[clamp(2rem,4vw,3rem)] leading-[1.2] lg:leading-[58px] tracking-[-1.8px] text-left">
                                    <span className="text-[#002962]">Easy Returns on </span>
                                    <span className="text-[#FD151B] pl-0 xl:pl-0">Eligible</span>
                                    <span className="block md:inline xl:block text-[#FD151B] pl-0 md:pl-2 xl:pl-0">
                                        Items
                                    </span>
                                </h1>
                                <h3 className="mt-4 text-[clamp(1rem,1.5vw,1.125rem)] font-normal leading-[32px] tracking-[-0.2px] text-[#161C2D] text-left">
                                    Returning an eligible item is simple:
                                </h3>

                                <div className="mt-4 space-y-2 text-left block lg:inline-block">
                                    <p className="font-bold text-[clamp(0.9375rem,1vw,1rem)] leading-[24px] sm:leading-[30px] tracking-[-0.5px] text-[#161C2D]">
                                        ✓ Request a return through your Shopperbeats account
                                    </p>
                                    <p className="font-bold text-[clamp(0.9375rem,1vw,1rem)] leading-[24px] sm:leading-[30px] tracking-[-0.5px] text-[#161C2D]">
                                        ✓ Receive return instructions
                                    </p>
                                    <p className="font-bold text-[clamp(0.9375rem,1vw,1rem)] leading-[24px] sm:leading-[30px] tracking-[-0.5px] text-[#161C2D]">
                                        ✓ Send the item back using the approved return method
                                    </p>
                                    <p className="font-bold text-[clamp(0.9375rem,1vw,1rem)] leading-[24px] sm:leading-[30px] tracking-[-0.5px] text-[#161C2D]">
                                        ✓ Receive your refund once the return is processed
                                    </p>
                                </div>

                                <div className="mt-6 max-w-[491px] text-left lg:inline-block">
                                    <p className="text-[clamp(1rem,1.5vw,1.125rem)] font-normal leading-[24px] tracking-[-0.2px] text-[#161C2D]">
                                        Most eligible items can be returned within the specified return period shown on the product page.
                                    </p>

                                    <button className="mt-4 text-[clamp(1rem,1.5vw,1.125rem)] font-bold leading-[32px] tracking-[-0.2px] text-[#FD151B] underline">
                                        Return &amp; Warranty
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                <section className="max-w-[1280px] mx-auto w-full">

                    <div className="lg:ml-[522px] mb-6">
                        <h1 className="font-bold text-[clamp(2rem,4vw,3rem)] leading-[117%] tracking-[-0.03em] text-left">
                            <span className="block md:inline text-[#002962]">Customer Support</span>

                            <span className="text-[#FD151B] pl-1">When You</span>

                            <span className="pl-1 lg:pl-0 inline md:inline xl:block text-[#FD151B]">Need It</span>
                        </h1>
                    </div>

                    <div className="relative bg-[#F2F4F7] rounded-[24px] h-auto lg:h-[386px]">

                        <div className="flex flex-col lg:flex-row h-full">

                            <div className="w-full lg:w-[482px] shrink-0 flex justify-center lg:justify-start">
                                <Image
                                    src="/images/indian-businesswoman-working-touchscreen-gadget-with-mind-wandering-faces.png"
                                    alt="Customer Support"
                                    width={482}
                                    height={546}
                                    className="w-[280px] md:w-[340px] h-auto opacity-100 rounded-br-[30px] lg:absolute lg:top-[-161px] lg:left-[1px] lg:w-[482px] lg:h-[546px] object-contain"
                                />
                            </div>

                            <div className="flex-1 flex items-center px-6 md:px-10 lg:pl-10 lg:pr-0 py-8 lg:py-0">

                                <div className="max-w-[569px] text-left">

                                    <p className="text-[clamp(1rem,1.5vw,1.125rem)] font-normal leading-[117%] tracking-[-0.03em] text-[#161C2D]">
                                        Our dedicated customer support team is here to help.
                                    </p>

                                    <p className="mt-5 text-[clamp(1rem,1.5vw,1.125rem)] font-normal leading-[30px] tracking-[-0.03em] text-[#161C2D]">
                                        Whether you have questions about an order, delivery,
                                        return, or refund, we&apos;re committed to providing fast and
                                        friendly assistance.
                                    </p>

                                    <h3 className="mt-6 text-[clamp(1.75rem,2.5vw,2.25rem)] font-medium leading-[30px] tracking-[-0.03em] text-black">
                                        Need help?
                                    </h3>

                                    <p className="mt-5 text-[clamp(1rem,1.5vw,1.125rem)] font-normal leading-[30px] tracking-[-0.03em] text-[#161C2D]">
                                        Contact Shopperbeats Customer Support through your
                                        account or our Help Centre.
                                    </p>

                                </div>

                            </div>

                        </div>
                    </div>

                </section>

                <section className="w-full flex justify-center">
                    <div className="w-full max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 xl:gap-8">

                        <div className="shrink-0 w-full max-w-[280px] md:max-w-[380px] lg:max-w-[450px] xl:max-w-[522px] flex justify-center">
                            <Image
                                src="/images/tempo_work.png"
                                alt="Tracked Delivery Truck"
                                width={522}
                                height={373}
                                className="w-full h-auto object-contain"
                                priority
                            />
                        </div>

                        <div className="w-full xl:max-w-[935px] flex flex-col justify-center text-left">

                            <h1 className="font-montserrat font-bold text-[clamp(2rem,4vw,3rem)] leading-[1.2] xl:leading-[58px] tracking-[-1.8px]">
                                <span className="text-[#002962]">Tracked </span>
                                <span className="text-[#FD151B]">Delivery</span>
                            </h1>

                            <p className="mt-2 font-montserrat font-normal text-[clamp(1rem,1.5vw,1.125rem)] leading-[26px] xl:leading-[32px] tracking-[-0.2px] text-[#161C2D]">
                                Stay informed every step of the way.
                            </p>

                            <p className="font-montserrat font-normal text-[clamp(1rem,1.5vw,1.125rem)] leading-[26px] xl:leading-[32px] tracking-[-0.2px] text-[#161C2D]">
                                Most orders include tracking information so you can
                            </p>

                            <div className="mt-3">
                                <ul className="list-disc pl-5 space-y-1 text-left marker:text-[#161C2D] inline-block lg:block">
                                    <li className="font-montserrat font-bold text-[clamp(0.9375rem,1vw,1rem)] leading-[26px] xl:leading-[30px] tracking-[-0.5px] text-[#161C2D]">
                                        Track your parcel in real time
                                    </li>

                                    <li className="font-montserrat font-bold text-[clamp(0.9375rem,1vw,1rem)] leading-[26px] xl:leading-[30px] tracking-[-0.5px] text-[#161C2D]">
                                        Monitor delivery progress
                                    </li>

                                    <li className="font-montserrat font-bold text-[clamp(0.9375rem,1vw,1rem)] leading-[26px] xl:leading-[30px] tracking-[-0.5px] text-[#161C2D]">
                                        Receive shipment updates
                                    </li>

                                    <li className="font-montserrat font-bold text-[clamp(0.9375rem,1vw,1rem)] leading-[26px] xl:leading-[30px] tracking-[-0.5px] text-[#161C2D]">
                                        Know when your order has been delivered
                                    </li>
                                </ul>
                            </div>

                            <p className="w-full xl:w-[935px] mt-1 font-montserrat font-normal text-[clamp(1rem,1.5vw,1.125rem)] leading-[26px] xl:leading-[32px] tracking-[-0.2px] text-[#161C2D]">
                                Tracking details are available in your Shopperbeats account once your order has been dispatched.
                            </p>

                            <p className="mt-2 font-montserrat font-bold text-[clamp(1rem,1.5vw,1.125rem)] leading-[26px] xl:leading-[32px] tracking-[-0.2px] text-[#161C2D]">
                                Shop Smarter. Shop Safer. Shop with Shopperbeats.
                            </p>

                        </div>

                    </div>
                </section>
            </div>

        </div>
    )
}

export default shopWithPeace;
