import Image from "next/image";
import "@/styles/auth.css";
import { product } from "@/lib/utils/main-utils";

export default function ReturnForm() {

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Choose Item To Return </h1>

            <div className="flex gap-6">
                <div className="card w-[70%]"><table className="cart-table">
                    <tbody>
                        <tr>
                            <td className="item-info return-cell">
                                <Image src={product.image} alt={product.name} width={150} height={200} loading="lazy" />
                                <div>
                                    <h3>{product.title}</h3>

                                    {product?.variant_attributes?.length > 0 ? (
                                        product.variant_attributes.map((attr, i) => (
                                            <p key={i}>
                                                <strong>{attr.name}:</strong> {attr.value}
                                            </p>
                                        ))
                                    ) : (
                                        <>
                                            <p>
                                                <strong>Size:</strong> {product.size}
                                            </p>
                                            <p>
                                                <strong>Colour:</strong> {product.color}
                                            </p>
                                        </>
                                    )}

                                    <p className="mt-2">
                                        <strong>Quantity:</strong> {product.quantity}
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table> </div>
                <div className="refund-card">
                    <div>
                        <div className="refund-top">
                            <div>
                                <h1 className="text-2xl font-semibold ">Refund Summary</h1>
                                <div>
                                    <p className="refund-label">Refund Subtotal</p>
                                </div>
                            </div>
                            <div className="refund-value">$38.99</div>
                        </div>

                    </div>
                    <div className="refund-row">
                        <p className="refund-label">Shipping</p>
                        <p className="refund-value">$5.99</p>
                    </div>
                    <div className="refund-row">
                        <p className="refund-total">Total Estimated Refund</p>
                        <p className="refund-total-val">$44.98</p>
                    </div>
                    <div className="refund-action">
                        <button className="btn btn-red btn-filled btn-sharp cursor-pointer ">Confirm Your Return</button>
                    </div>
                    <div className="refund-date">
                        Return By <span className="refund-date-val">Dec,10,2026</span>
                    </div>
                </div>
            </div>
        </div>
    )
}