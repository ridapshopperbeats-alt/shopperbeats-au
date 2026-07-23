import Image from "next/image";

export default function ReturnForm() {
    const product = {
        product_id: "123",
        name: "Premium Cotton T-Shirt",
        title: "Premium Cotton T-Shirt",
        image: "/images/image-coming-soon.jpg",
        quantity: 1,
        size: "M",
        color: "Black",
        variant_attributes: [
            { name: "Size", value: "M" },
            { name: "Colour", value: "Black" },
            { name: "Fabric", value: "Cotton" },
        ],
    };
    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Choose Item To Return </h1>

            <div className="flex gap-6">
                <div className="card w-[70%]"><table className="cart-table">
                    <tbody>
                        <tr>
                            <td className="item-info" style={{
                                borderBottom: "none",
                                padding: "20px 0px"
                            }}>
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
                <div className="card grid gap-2 w-[30%]">
                    <div>
                        <div className="flex  justify-between  w-full">
                            <div>
                                <h1 className="text-2xl font-semibold ">Refund Summary</h1>
                                <div>
                                    <p className="text-[#726969] ">Refund Subtotal</p>
                                </div>
                            </div>
                            <div className="text-[#fd151b]">$38.99</div>
                        </div>

                    </div>
                    <div className="flex justify-between">
                        <p className="text-[#726969] ">Shipping</p>
                        <p className="text-[#fd151b]">$5.99</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="font-semibold">Total Estimated Refund</p>
                        <p className="text-[#fd151b] font-bold">$44.98</p>
                    </div>
                    <div className="flex justify-end mt-[18px]">
                        <button className="btn btn-red btn-filled btn-sharp cursor-pointer ">Confirm Your Return</button>
                    </div>
                    <div className="flex justify-end  font-[500] text-[16px] text-[#726969]">
                        Return By <span className="font-[700] text-[#726969] ml-2">Dec,10,2026</span>
                    </div>
                </div>
            </div>
        </div>
    )
}