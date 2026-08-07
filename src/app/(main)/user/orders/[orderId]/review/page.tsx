"use client";

import { useState, ChangeEvent, use } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";

import {
  useAddReviewMutation,
  useGetOrderByIdQuery,
} from "@/lib/redux/apis/order-api";
import { useUploadAnyImageMutation } from "@/lib/redux/apis/products-api";
import {
  findOrderProduct,
  getOrderProductImage,
  getReviewProductId,
} from "@/lib/utils/order-products";
import { Check, ChevronLeft, Clock3, ImagePlus, Star, X } from "lucide-react";
import { getStaticOrder, isStaticOrderId } from "@/lib/mock/static-orders";
import StatusBanner from "@/components/common/Tooltip";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/input";

interface ReviewPageProps {
  params: Promise<{ orderId: string }>;
}

const COMMENT_MAX_LENGTH = 500;

export default function ReviewForm({ params }: ReviewPageProps) {
  const { orderId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get("product_id");

  const isStatic = isStaticOrderId(orderId);
  const {
    data: fetchedOrder,
    isLoading,
    isError,
  } = useGetOrderByIdQuery(orderId, { skip: isStatic });
  const order = isStatic ? getStaticOrder(orderId) : fetchedOrder;
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

  const handleClose = () => {
    router.push(`/user/orders/${orderId}`);
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
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if ((!isStatic && isError) || !order) {
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

  const variantTags: string[] = product.variant_attributes?.length
    ? product.variant_attributes.map((attr) => attr.value)
    : ([product.size, product.color].filter(Boolean) as string[]);

  const fieldInputClass =
    "w-full rounded-xl border border-gray-200 bg-[#F9FAFB] px-4 py-3 text-[12px] text-black placeholder:text-[12px]! placeholder:text-[#BBBBBB]! placeholder:opacity-100";

  return (
    <div className="flex flex-col gap-4 w-full max-w-[1118px]">
      <Link
        href="/user/orders"
        className="inline-flex items-center gap-1 text-[12px] font-semibold leading-[18px] text-[#99a1af]"
      >
        <ChevronLeft size={16} /> Back to My Orders
      </Link>

      <StatusBanner
        icon={Clock3}
        text="Reviewing order"
        highlightText={`#${order.order_number || order.id}`}
        suffixText="Delivered on 10 August 2026."
      />

      <Card className=" gap-5 p-6">
        <div className="flex w-full items-start gap-4">
          <Image
            src={productImageSrc}
            alt={product.title || product.name || "Product"}
            className="shrink-0 rounded-lg object-cover"
            width={62}
            height={62}
          />

          <div className="flex flex-col gap-2">
            <h3 className="text-[13px] leading-[16px] font-bold text-black">
              {product.title || product.name}
            </h3>

            {variantTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {variantTags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-[30px] bg-[#f3f4f6] px-2.5 py-1 text-[10px] font-medium text-[#99a1af]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* <p className="text-[13px] text-black">
              <span className="font-semibold">Quantity:</span>{" "}
              {product.quantity}
            </p> */}
            {/* <p className="text-[13px] text-black">
              <span className="font-semibold">Order:</span>{" "}
              {order.order_number || order.id}
            </p> */}
          </div>
        </div>

        <div className="h-px w-full bg-gray-100" />

        <div className="w-full">
          <span className="mb-2 block text-[11px] font-bold  leading-[16px] text-[#6A7282] tracking-[0.55px]">
            Your Rating
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((val) => (
              <Star
                key={val}
                size={24}
                onClick={() => handleStarClick(val)}
                className={`cursor-pointer ${
                  rating >= val
                    ? "fill-[#FFCB45] text-[#FFCB45]"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="w-full">
          <label
            htmlFor="review-title"
            className="mb-2 block text-[11px] font-bold  leading-[16px] text-[#6A7282] tracking-[0.55px]"
          >
            Review Title
          </label>
          <input
            id="review-title"
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Perfect fit, great quality!"
            className="review-input"
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="review-comments"
            className="mb-2 block text-[11px] font-bold  leading-[16px] text-[#6A7282] tracking-[0.55px]"
          >
            Your Review
          </label>
          <textarea
            id="review-comments"
            data-slot="input"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            maxLength={COMMENT_MAX_LENGTH}
            placeholder="Tell others what you think about this product — fit, quality, packaging, delivery experience..."
            className={`${fieldInputClass} max-h-[100px] focus:outline-none focus:ring-0 bg-white`}
          />
          <span className="mt-1 block text-right text-[11px] text-[#D1D5DC]">
            {comments.length}/{COMMENT_MAX_LENGTH}
          </span>
        </div>

        <div className="w-full">
          <span className="mb-2 block text-[11px] font-bold  leading-[16px] text-[#6A7282] tracking-[0.55px]">
            Add Photos (Optional)
          </span>

          <label
            htmlFor="image-upload"
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
          >
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFileChange}
            />

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
              <ImagePlus size={18} />
            </span>

            <span className="flex flex-col">
              <span className="text-[13px] font-bold text-[#6A7282]">
                Upload Photos
              </span>
              <span className="text-[10px] leading-[15px] text-[#D1D5DC]">
                JPG, PNG up to 5MB each · Max 5 photos
              </span>
            </span>
          </label>

          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <Image
                    src={URL.createObjectURL(img)}
                    alt="preview"
                    width={80}
                    height={80}
                    loading="lazy"
                    className="rounded-lg border border-gray-200 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    aria-label="Remove image"
                    className="absolute -right-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#FD151B] text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-8">
          {/* {[
            {
              id: 1,
              value: "yes",
              label: "Yes, i would recommend this product",
            },
            {
              id: 2,
              value: "no",
              label: "No, i would not recommend this product",
            },
          ].map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-2"
            >
              <input type="radio" name="recommend" value={item.value} />
              <span className="text-sm text-gray-800">{item.label}</span>
            </label>
          ))} */}
        </div>
      </Card>

      <StatusBanner
        cancelText="Cancel"
        submitText="Submit Review"
        SubmitIcon={Check}
        onSubmitText="Submitting..."
        onSubmit={handleSubmit}
        onCancel={handleClose}
        isLoading={isSubmitting}
        disabled={isSubmitting}
        text="0 of 1 items rated"
        className="h-[70px]"
      />
    </div>
  );
}
