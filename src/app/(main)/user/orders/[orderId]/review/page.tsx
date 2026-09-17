"use client";

import { useMemo, useState, ChangeEvent, use } from "react";

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
  canReviewProduct,
  getOrderProductImage,
  getReviewProductId,
  mapOrderProducts,
} from "@/lib/utils/order-products";
import { Check, ChevronLeft, Clock3, ImagePlus, Star, X } from "lucide-react";
import { formatReadableDate } from "@/lib/utils/main-utils";
import { getApiErrorMessage } from "@/lib/utils/api-error";
import StatusBanner from "@/components/common/Tooltip";
import { Card } from "@/components/common/Card";
import { StatusBadge, BadgeColor } from "@/components/common/StatusBadge";
import { APIProduct } from "@/types/order";

interface ReviewPageProps {
  params: Promise<{ orderId: string }>;
}

interface ProductReviewState {
  rating: number;
  headline: string;
  comments: string;
  images: File[];
}

const EMPTY_REVIEW: ProductReviewState = {
  rating: 0,
  headline: "",
  comments: "",
  images: [],
};

const COMMENT_MAX_LENGTH = 500;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "svg", "webp"];

function isAllowedImageFile(file: File): boolean {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) return true;
  const extension = file.name.split(".").pop()?.toLowerCase();
  return !!extension && ALLOWED_IMAGE_EXTENSIONS.includes(extension);
}

export default function ReviewForm({ params }: ReviewPageProps) {
  const { orderId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedProductId = searchParams.get("product_id");

  const {
    data: order,
    isLoading,
    isError,
  } = useGetOrderByIdQuery(orderId);
  const [addReview] = useAddReviewMutation();
  const [uploadImage] = useUploadAnyImageMutation();

  const reviewableProducts: APIProduct[] = useMemo(
    () => (order ? mapOrderProducts(order).filter(canReviewProduct) : []),
    [order]
  );

  const [reviews, setReviews] = useState<Record<string, ProductReviewState>>(
    {}
  );
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [manuallySelectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultId = useMemo(() => {
    if (reviewableProducts.length === 0) return null;

    const requested = requestedProductId
      ? reviewableProducts.find(
          (p) => getReviewProductId(p) === requestedProductId
        )
      : undefined;

    return getReviewProductId(requested ?? reviewableProducts[0]);
  }, [reviewableProducts, requestedProductId]);

  const selectedId = manuallySelectedId ?? defaultId;

  const getReviewState = (id: string) => reviews[id] ?? EMPTY_REVIEW;

  const updateReview = (id: string, patch: Partial<ProductReviewState>) => {
    setReviews((prev) => ({
      ...prev,
      [id]: { ...getReviewState(id), ...patch },
    }));
  };

  const handleFileChange = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      const validFiles = selected.filter(isAllowedImageFile);

      if (validFiles.length < selected.length) {
        toast.error("Only JPG, JPEG, PNG, SVG, and WEBP files are allowed.");
      }

      if (validFiles.length > 0) {
        updateReview(id, {
          images: [...getReviewState(id).images, ...validFiles],
        });
      }
      e.target.value = "";
    }
  };

  const removeImage = (id: string, indexToRemove: number) => {
    updateReview(id, {
      images: getReviewState(id).images.filter(
        (_, idx) => idx !== indexToRemove
      ),
    });
  };

  const handleClose = () => {
    router.push(`/user/orders/${orderId}`);
  };

  const selectedProduct = reviewableProducts.find(
    (p) => getReviewProductId(p) === selectedId
  );

  const handleSubmit = async () => {
    if (!selectedProduct || !selectedId) return;

    const review = getReviewState(selectedId);
    if (!review.rating || !review.headline.trim() || !review.comments.trim()) {
      toast.error("Please add a rating, title, and review before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);

      const uploadedImageUrls: string[] = [];
      for (const file of review.images) {
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
        reviewer_name: "Customer",
        rating: review.rating,
        comment: review.comments,
        product_id: selectedId,
        ...(selectedProduct.variant_id
          ? { variant_id: selectedProduct.variant_id }
          : {}),
        order_id: orderId,
        title: review.headline,
        images: uploadedImageUrls,
      }).unwrap();

      toast.success("Review submitted successfully!");

      const submittedId = selectedId;
      setReviewedIds((prev) => new Set(prev).add(submittedId));

      const nextPending = reviewableProducts.find(
        (p) =>
          getReviewProductId(p) !== submittedId &&
          !reviewedIds.has(getReviewProductId(p))
      );

      if (nextPending) {
        setSelectedId(getReviewProductId(nextPending));
      } else {
        router.push(`/user/orders/${orderId}`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to submit review."));
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

  if (reviewableProducts.length === 0) {
    return (
      <div>
        <p>No products found in this order.</p>
        <Link
          href={`/user/orders/${orderId}`}
          className="btn btn-red btn-filled btn-sharp mt-20"
        >
          Back to Order
        </Link>
      </div>
    );
  }

  const fieldInputClass =
    "w-full rounded-xl border border-gray-200 bg-[#F9FAFB] px-4 py-3 text-[12px] text-black placeholder:text-[12px]! placeholder:text-[#BBBBBB]! placeholder:opacity-100";

  const review = selectedId ? getReviewState(selectedId) : EMPTY_REVIEW;
  const variantTags: string[] = selectedProduct?.variant_attributes?.length
    ? selectedProduct.variant_attributes.map((attr) => attr.value)
    : ([selectedProduct?.size, selectedProduct?.color].filter(
        Boolean
      ) as string[]);

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
        suffixText={
          order.created_at
            ? `Delivered on ${formatReadableDate(order.created_at)}.`
            : undefined
        }
      />

      {reviewableProducts.length > 1 && (
        <Card className="gap-3 p-6">
          <span className="text-12px font-bold leading-[16px] text-[#6A7282] tracking-[0.55px]">
            Select a product to review
          </span>
          <div className="flex flex-wrap gap-3">
            {reviewableProducts.map((product) => {
              const id = getReviewProductId(product);
              const isReviewed = reviewedIds.has(id);
              const isSelected = id === selectedId;

              return (
                <button
                  key={id}
                  type="button"
                  disabled={isReviewed}
                  onClick={() => setSelectedId(id)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? "border-[#FD151B] bg-[#FFF5F5]"
                      : "border-gray-200 bg-white"
                  } ${isReviewed ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                >
                  <Image
                    src={getOrderProductImage(product)}
                    alt={product.title || product.name || "Product"}
                    className="shrink-0 rounded-lg object-cover"
                    width={36}
                    height={36}
                  />
                  <span className="fluid-text-xs font-semibold text-black">
                    {product.title || product.name}
                  </span>
                  {isReviewed && (
                    <StatusBadge
                      label="Reviewed"
                      color={BadgeColor.Green}
                      showDot={false}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {selectedProduct && selectedId && (
        <Card key={selectedId} className="gap-5 p-6">
          <div className="flex w-full items-start gap-4">
            <Image
              src={getOrderProductImage(selectedProduct)}
              alt={selectedProduct.title || selectedProduct.name || "Product"}
              className="shrink-0 rounded-lg object-cover"
              width={62}
              height={62}
            />

            <div className="flex flex-col gap-2">
              <h3 className="fluid-text-xs leading-[16px] font-bold text-black">
                {selectedProduct.title || selectedProduct.name}
              </h3>

              {variantTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {variantTags.map((tag) => (
                    <StatusBadge
                      key={tag}
                      label={tag}
                      color={BadgeColor.Gray}
                      showDot={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-px w-full bg-gray-100" />

          <div className="w-full">
            <span className="mb-2 block text-12px font-bold  leading-[16px] text-[#6A7282] tracking-[0.55px]">
              Your Rating
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((val) => (
                <Star
                  key={val}
                  size={24}
                  onClick={() => updateReview(selectedId, { rating: val })}
                  className={`cursor-pointer ${
                    review.rating >= val
                      ? "fill-[#FFCB45] text-[#FFCB45]"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="w-full">
            <label
              htmlFor={`review-title-${selectedId}`}
              className="mb-2 block text-12px font-bold  leading-[16px] text-[#6A7282] tracking-[0.55px]"
            >
              Review Title
            </label>
            <input
              id={`review-title-${selectedId}`}
              type="text"
              value={review.headline}
              onChange={(e) =>
                updateReview(selectedId, { headline: e.target.value })
              }
              placeholder="e.g. Perfect fit, great quality!"
              className="review-input"
            />
          </div>

          <div className="w-full">
            <label
              htmlFor={`review-comments-${selectedId}`}
              className="mb-2 block text-12px font-bold  leading-[16px] text-[#6A7282] tracking-[0.55px]"
            >
              Your Review
            </label>
            <textarea
              id={`review-comments-${selectedId}`}
              data-slot="input"
              value={review.comments}
              onChange={(e) =>
                updateReview(selectedId, { comments: e.target.value })
              }
              maxLength={COMMENT_MAX_LENGTH}
              placeholder="Tell others what you think about this product — fit, quality, packaging, delivery experience..."
              className={`${fieldInputClass} max-h-[100px] focus:outline-none focus:ring-0 bg-white`}
            />
            <span className="mt-1 block text-right text-12px text-[#D1D5DC]">
              {review.comments.length}/{COMMENT_MAX_LENGTH}
            </span>
          </div>

          <div className="w-full">
            <span className="mb-2 block text-12px font-bold  leading-[16px] text-[#6A7282] tracking-[0.55px]">
              Add Photos (Optional)
            </span>

            <label
              htmlFor={`image-upload-${selectedId}`}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <input
                id={`image-upload-${selectedId}`}
                type="file"
                accept="image/jpeg,image/png,image/svg+xml,image/webp"
                multiple
                hidden
                onChange={(e) => handleFileChange(selectedId, e)}
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

            {review.images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {review.images.map((img, idx) => (
                  <div
                    key={`${img.name}-${img.size}-${img.lastModified}`}
                    className="relative"
                  >
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
                      onClick={() => removeImage(selectedId, idx)}
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
        </Card>
      )}

      <StatusBanner
        cancelText="Cancel"
        submitText="Submit Review"
        SubmitIcon={Check}
        onSubmitText="Submitting..."
        onSubmit={handleSubmit}
        onCancel={handleClose}
        isLoading={isSubmitting}
        disabled={isSubmitting || isLoading || !selectedProduct}
        text={`${reviewedIds.size} of ${reviewableProducts.length} items reviewed`}
        className="h-[70px]"
      />
    </div>
  );
}
