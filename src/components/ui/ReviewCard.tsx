
import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { Review } from "@/types/product";

const ReviewCard = ({ review }: { review: Review }) => {
  if (!review) {
    return null;
  }

  const { rating, comment, reviewer_name } = review;

  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating))
      return <FaStar key={i} className="text-yellow-400" />;
    if (i < rating) return <FaStarHalfAlt key={i} className="text-yellow-400" />;
    return <FaRegStar key={i} className="star" />;
  });

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="rating !flex">{stars}</div>
      </div>

      <h4 className="review-title">{comment.substring(0, 20)}...</h4>
      <p className="review-text !text-gray-500 !font-[300]">{comment}</p>
      <p className="review-customer" style={{
        fontSize: "16px"
      }}>{reviewer_name}</p>
    </div>
  );
};

export default ReviewCard;
