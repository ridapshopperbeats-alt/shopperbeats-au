import Image from "next/image";
import styles from "@/styles/ShopWithPeace.module.css";

const shopWithPeace = () => {
    return (
        <div>
            <div className={styles.wrapper}>

                <section className={styles.heroSection}>
                    <div className={styles.heroInner}>

                        <div className={styles.heroImageWrapper}>
                            <Image
                                src="/images/shopwith-peace1.svg"
                                alt="Shop With Confidence"
                                width={540}
                                height={380}
                                className={styles.heroImage}
                            />
                        </div>

                        <div className={styles.heroTextWrapper}>
                            <h1 className={styles.heroTitle}>
                                <span className={styles.heroTitleLine1}>Shop with</span>
                                <span className={styles.heroTitleLine2}>Peace of Mind</span>
                            </h1>

                            <h3 className={styles.heroSubtitle}>
                                Shop with Confidence
                            </h3>

                            <p className={styles.heroDescription}>
                                Get the item you ordered or your money back. At Shopperbeats, we want
                                every customer to shop with confidence. If your order doesn&apos;t arrive,
                                arrives damaged, or is significantly different from the description,
                                we&apos;ll work with you to resolve the issue quickly.
                            </p>
                        </div>
                    </div>
                </section>

                <section className={styles.mbgSection}>
                    <div className={styles.mbgContainer}>

                        <div className={styles.mbgRow}>
                            <div className={styles.mbgTextWrapper}>
                                <h1 className={styles.mbgTitle}>
                                    <span className={styles.mbgTitleBlue}>Money Back </span>
                                    <span className={styles.mbgTitleRed}>Guarantee</span>
                                </h1>

                                <h3 className={styles.mbgSubtitle}>
                                    If your eligible order:
                                </h3>

                                <div className={styles.mbgListWrapper}>
                                    <ul className={styles.mbgList}>
                                        <li className={styles.mbgListItem}>
                                            Arrives damaged or defective
                                        </li>
                                        <li className={styles.mbgListItem}>
                                            Is significantly different from the product description
                                        </li>
                                        <li className={styles.mbgListItem}>
                                            Is missing items from your order
                                        </li>
                                    </ul>
                                </div>

                                <p className={styles.mbgParagraph}>
                                    You may be eligible for a full refund under our Money Back Guarantee policy.
                                </p>

                                <p className={styles.mbgBoldParagraph}>
                                    Your satisfaction is our priority
                                </p>
                            </div>

                            <div className={styles.mbgImageWrapper}>
                                <Image
                                    src="/images/moneyback.png"
                                    alt="Money Back Guarantee"
                                    height={345}
                                    width={470}
                                    className={styles.mbgImage}
                                />
                            </div>
                        </div>

                        <div className={styles.returnsRow}>
                            <div className={styles.returnsImageWrapper}>
                                <Image
                                    src="/images/ref_img1.png"
                                    alt="Easy Returns"
                                    height={496}
                                    width={449}
                                    className={styles.returnsImage}
                                />
                            </div>

                            <div className={styles.returnsTextWrapper}>
                                <h1 className={styles.returnsTitle}>
                                    <span className={styles.mbgTitleBlue}>Easy Returns on </span>
                                    <span className={`${styles.mbgTitleRed} ${styles.returnsTitleExtra}`}>Eligible</span>
                                    <span className={styles.returnsTitleBlockRed}>
                                        Items
                                    </span>
                                </h1>
                                <h3 className={styles.returnsSubtitle}>
                                    Returning an eligible item is simple:
                                </h3>

                                <div className={styles.returnsStepsWrapper}>
                                    <p className={styles.returnsStep}>
                                        ✓ Request a return through your Shopperbeats account
                                    </p>
                                    <p className={styles.returnsStep}>
                                        ✓ Receive return instructions
                                    </p>
                                    <p className={styles.returnsStep}>
                                        ✓ Send the item back using the approved return method
                                    </p>
                                    <p className={styles.returnsStep}>
                                        ✓ Receive your refund once the return is processed
                                    </p>
                                </div>

                                <div className={styles.returnsNoteWrapper}>
                                    <p className={styles.returnsNote}>
                                        Most eligible items can be returned within the specified return period shown on the product page.
                                    </p>

                                    <button className={styles.returnsWarrantyButton}>
                                        Return &amp; Warranty
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                <section className={styles.supportSection}>

                    <div className={styles.supportHeadingWrapper}>
                        <h1 className={styles.supportTitle}>
                            <span className={styles.supportTitleBlue}>Customer Support</span>

                            <span className={styles.supportTitleRedInline}>When You</span>

                            <span className={styles.supportTitleRedBlock}>Need It</span>
                        </h1>
                    </div>

                    <div className={styles.supportCard}>

                        <div className={styles.supportCardInner}>

                            <div className={styles.supportImageWrapper}>
                                <Image
                                    src="/images/indian-businesswoman-working-touchscreen-gadget-with-mind-wandering-faces.png"
                                    alt="Customer Support"
                                    width={482}
                                    height={546}
                                    className={styles.supportImage}
                                />
                            </div>

                            <div className={styles.supportTextOuter}>

                                <div className={styles.supportTextWrapper}>

                                    <p className={styles.supportText}>
                                        Our dedicated customer support team is here to help.
                                    </p>

                                    <p className={styles.supportTextSpaced}>
                                        Whether you have questions about an order, delivery,
                                        return, or refund, we&apos;re committed to providing fast and
                                        friendly assistance.
                                    </p>

                                    <h3 className={styles.supportSubheading}>
                                        Need help?
                                    </h3>

                                    <p className={styles.supportTextSpaced}>
                                        Contact Shopperbeats Customer Support through your
                                        account or our Help Centre.
                                    </p>

                                </div>

                            </div>

                        </div>
                    </div>

                </section>

                <section className={styles.deliverySection}>
                    <div className={styles.deliveryInner}>

                        <div className={styles.deliveryImageWrapper}>
                            <Image
                                src="/images/tempo_work.png"
                                alt="Tracked Delivery Truck"
                                width={522}
                                height={373}
                                className={styles.deliveryImage}
                                priority
                            />
                        </div>

                        <div className={styles.deliveryTextWrapper}>

                            <h1 className={styles.deliveryTitle}>
                                <span className={styles.mbgTitleBlue}>Tracked </span>
                                <span className={styles.mbgTitleRed}>Delivery</span>
                            </h1>

                            <p className={styles.deliverySubtitle}>
                                Stay informed every step of the way.
                            </p>

                            <p className={styles.deliveryParagraph}>
                                Most orders include tracking information so you can
                            </p>

                            <div className={styles.deliveryListWrapper}>
                                <ul className={styles.deliveryList}>
                                    <li className={styles.deliveryListItem}>
                                        Track your parcel in real time
                                    </li>

                                    <li className={styles.deliveryListItem}>
                                        Monitor delivery progress
                                    </li>

                                    <li className={styles.deliveryListItem}>
                                        Receive shipment updates
                                    </li>

                                    <li className={styles.deliveryListItem}>
                                        Know when your order has been delivered
                                    </li>
                                </ul>
                            </div>

                            <p className={styles.deliveryFootnote}>
                                Tracking details are available in your Shopperbeats account once your order has been dispatched.
                            </p>

                            <p className={styles.deliveryTagline}>
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
