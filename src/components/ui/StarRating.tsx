import { Star } from "lucide-react";

export default function StarRating({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <Star
            key={i}
            size={size}
            className={
              filled || half
                ? "fill-[#FFCB45] text-[#FFCB45]"
                : "text-[#E2E2E2]"
            }
          />
        );
      })}
    </div>
  );
}
