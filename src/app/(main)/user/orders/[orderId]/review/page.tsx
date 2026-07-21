"use client";

import { useState, ChangeEvent, use } from "react";
import Button from "@/components/common/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";
import {
  useGetOrderByIdQuery,
  useAddReviewMutation,
} from "@/lib/redux/apis/order-api";
import { useUploadAnyImageMutation } from "@/lib/redux/apis/products-api";
import {
  findOrderProduct,
  getOrderProductImage,
  getReviewProductId,
} from "@/lib/utils/order-products";

import "../../../../../../styles/Checkout.css";
import "../../../../../../styles/Cart.css";
import "../../../../../../styles/Product.css";

interface ReviewPageProps {
  params: Promise<{ orderId: string }>;
}

export default function ReviewForm({ params }: ReviewPageProps) {
  const { orderId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get("product_id");

  const { data: order, isLoading, isError } = useGetOrderByIdQuery(orderId);
  const [addReview] = useAddReviewMutation();
  const [uploadImage] = useUploadAnyImageMutation();

  const product = order ? findOrderProduct(order, productIdParam) : undefined;
  const reviewProductId = product
    ? getReviewProductId(product)
    : productIdParam || "";
  const productImageSrc = product ? getOrderProductImage(product) : "";

  const [images, setImages] = useState<File[]>([]);
  const [rating, setRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [headline, setHeadline] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...selectedFiles]);
      e.target.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (!reviewProductId) {
      toast.error("Product not found for this review.");
      return;
    }
    if (rating === 0) {
      toast.error("Please provide a rating.");
      return;
    }
    if (!headline.trim()) {
      toast.error("Please provide a headline.");
      return;
    }
    if (!comments.trim()) {
      toast.error("Please provide comments.");
      return;
    }

    try {
      setIsSubmitting(true);

      const uploadedImageUrls: string[] = [];
      for (const file of images) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_type", "product");
        formData.append("media_type", "image");
        const uploadRes = await uploadImage(formData).unwrap();
        if (uploadRes?.image_url || uploadRes?.url) {
          uploadedImageUrls.push(uploadRes.image_url || uploadRes.url || "");
        }
      }

      await addReview({
        reviewer_name: reviewerName.trim() || "Customer",
        rating,
        comment: comments,
        product_id: reviewProductId,
        order_id: orderId,
        title: headline,
        images: uploadedImageUrls,
      }).unwrap();

      toast.success("Review submitted successfully!");
      setImages([]);
      setRating(0);
      setHeadline("");
      setComments("");
      router.push(`/user/orders/${orderId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isError || !order) {
    return (
      <div>
        <p>Order not found.</p>
        <Link
          href="/user/orders"
          className="btn btn-red btn-filled btn-sharp mt-20"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!product || !reviewProductId) {
    return (
      <div>
        <p>Product not found in this order.</p>
        <Link
          href={`/user/orders/${orderId}`}
          className="btn btn-red btn-filled btn-sharp mt-20"
        >
          Back to Order
        </Link>
      </div>
    );
  }

  return (
    <div className="">
      <h4 className="mb-30">Add Review</h4>

      <table className="cart-table order-table">
        <tbody>
          <tr>
            <td className="item-info">
              <Image
                src={productImageSrc}
                alt={product.title || product.name || "Product"}
                className="cursor-pointer"
                width={137}
                height={137}
              />
              <div>
                <h3>{product.title || product.name}</h3>

                {product.variant_attributes?.length ? (
                  product.variant_attributes.map((attr, i) => (
                    <p key={i}>
                      <strong>{attr.name}:</strong> {attr.value}
                    </p>
                  ))
                ) : (
                  <>
                    {product.size && (
                      <p>
                        <strong>Size:</strong> {product.size}
                      </p>
                    )}
                    {product.color && (
                      <p>
                        <strong>Colour:</strong> {product.color}
                      </p>
                    )}
                  </>
                )}

                <p className="mt-2">
                  <strong>Quantity:</strong> {product.quantity}
                </p>
                <p className="mt-2">
                  <strong>Order:</strong> {order.order_number || order.id}
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="form-item mt-30">
        <div className="label-text review-label-bold">Add Image (Optional)</div>

        <label htmlFor="image-upload" className="upload-box">
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileChange}
          />

          <img
            src="/images/profile/imageUpload.svg"
            alt="Add"
            className="w-full h-full object-contain"
          />
        </label>

        {images.length > 0 && (
          <div className="review-preview-list">
            {images.map((img, idx) => (
              <div key={idx} className="review-preview-item">
                <Image
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  width={80}
                  height={80}
                  loading="lazy"
                  className="review-preview-img"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="review-remove-btn"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-item">
        <label>
          Overall Rating<span className="text-red-500">*</span>
        </label>
        <div className="fa-stars">
          {[1, 2, 3, 4, 5].map((val) => (
            <i
              key={val}
              className={`fa-star review-star ${rating >= val ? "fa-solid" : "fa-regular"}`}
              onClick={() => handleStarClick(val)}
            />
          ))}
        </div>
      </div>

      <div className="form-item">
        <label>Display Name</label>
        <input
          type="text"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          placeholder="Your name (optional)"
        />
      </div>

      <div className="form-item">
        <label>
          Review Headline<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
      </div>

      <div className="form-item">
        <label>
          Comments<span className="text-red-500">*</span>
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="rounded-15px-imp"
        />
      </div>

      <div className="flex items-center gap-8">
        {[
          { id: 1, value: "yes", label: "Yes, i would recommend this product" },
          {
            id: 2,
            value: "no",
            label: "No, i would not recommend this product",
          },
        ].map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input type="radio" name="recommend" value={item.value} />
            <span className="text-sm text-gray-800">{item.label}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          className="btn btn-red btn-filled btn-sharp mt-30"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </div>
  );
}
