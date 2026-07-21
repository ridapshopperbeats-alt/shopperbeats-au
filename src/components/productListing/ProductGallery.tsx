import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import ReusableSlider, {
  ReusableSliderRef,
} from "@/components/common/ReusableSlider";
import { Product, ProductImage, Variant } from "@/types/product";
import { Heart } from "lucide-react";
import ImagePreviewModal from "./ImagePreviewModal";

const THUMBS_VISIBLE = 11;

interface ProductGalleryProps {
  product: Product;
  selectedVariant: Variant | null;
  isWishlisted?: boolean;
  onWishlistToggle?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isWishlistLoading?: boolean;
}

const defaultImageUrl = "/images/image-coming-soon.jpg";

const safeUrl = (url?: string | null): string => {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return defaultImageUrl;
  }
  return url;
};

const getYouTubeVideoId = (url: string): string | null => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
};

const isYouTubeUrl = (url: string): boolean => {
  return getYouTubeVideoId(url) !== null;
};

const ProductGallery: React.FC<ProductGalleryProps> = ({
  product,
  selectedVariant,
  isWishlisted = false,
  onWishlistToggle,
  isWishlistLoading = false,
}) => {
  const sliderRef = useRef<ReusableSliderRef>(null);

  const getImages = useCallback((variantId?: string): ProductImage[] => {
    let images: ProductImage[] = [];

    if (variantId) {
      const variant = product?.variants?.find((v) => v.id === variantId);

      if (variant?.images) {
        const variantImages = Array.isArray(variant.images)
          ? variant.images
          : [{ image_url: variant.images }];

        images = variantImages.map((img) =>
          typeof img === "string" ? { image_url: img, is_main: false } : img,
        );
      }
    }

    if (!images.length && product.images) {
      const productImages = Array.isArray(product.images)
        ? product.images
        : [{ image_url: product.images }];

      images = productImages.map((img) =>
        typeof img === "string" ? { image_url: img, is_main: false } : img,
      );
    }

    if (!images.length) {
      images = [{ image_url: defaultImageUrl, is_main: true }];
    }

    const validImages = images.filter((img) => {
      const imgUrl = img?.image_url?.trim();
      const vidUrl = img?.video_url?.trim();

      return Boolean(imgUrl || vidUrl);
    });

    validImages.sort((a, b) => {
      const aIsVideo = !!a.video_url && !a.image_url;
      const bIsVideo = !!b.video_url && !b.image_url;

      if (aIsVideo !== bIsVideo) {
        return aIsVideo ? 1 : -1;
      }

      const orderA = a.order ?? a.image_order ?? Number.MAX_SAFE_INTEGER;

      const orderB = b.order ?? b.image_order ?? Number.MAX_SAFE_INTEGER;

      return orderA - orderB;
    });

    return validImages;
  }, [product]);

  // Derived state: `images` is fully computed from `product`/`selectedVariant`,
  // so it doesn't need its own useState + effect. useMemo keeps the array
  // reference stable across unrelated re-renders (matching the previous
  // cadence at which the preload effect below used to see a "new" images
  // array).
  const images = useMemo(
    () => getImages(selectedVariant?.id),
    [getImages, selectedVariant],
  );

  const initialMedia = safeUrl(images[0]?.image_url || images[0]?.video_url);

  const [activeThumbnail, setActiveThumbnail] = useState<string>(initialMedia);

  const [mainImage, setMainImage] = useState<string>(initialMedia);

  const [isHovered, setIsHovered] = useState(false);

  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  const [thumbStart, setThumbStart] = useState(0);

  const [mobileSlide, setMobileSlide] = useState(0);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string>(initialMedia);

  const openPreview = useCallback((mediaUrl: string) => {
    setPreviewUrl(safeUrl(mediaUrl));
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  // `loadedUrlsRef` is bookkeeping used only inside the preload effect below
  // (effects are allowed to read refs). Render reads `loadedUrls` state
  // instead, since reading a ref's `.current` during render is unsafe.
  const loadedUrlsRef = useRef<Set<string>>(new Set());

  const [loadedUrls, setLoadedUrls] = useState<Set<string>>(new Set());

  const isLoaded = (url: string) => loadedUrls.has(url);

  const markLoaded = useCallback((url: string) => {
    if (!loadedUrlsRef.current.has(url)) {
      loadedUrlsRef.current.add(url);
      setLoadedUrls((prev) => new Set(prev).add(url));
    }
  }, []);

  // Reset the active/main thumbnail (and thumbnail/slide scroll position)
  // whenever the variant or product changes. Adjusted directly during render
  // (React's recommended pattern for state that derives from a changed prop,
  // using state rather than a ref so it stays safe to read during render)
  // instead of inside an effect, to avoid an extra render pass.
  const [prevSelectedVariant, setPrevSelectedVariant] = useState(selectedVariant);
  const [prevProduct, setPrevProduct] = useState(product);

  if (selectedVariant !== prevSelectedVariant || product !== prevProduct) {
    setPrevSelectedVariant(selectedVariant);
    setPrevProduct(product);

    const firstMedia = safeUrl(images[0]?.image_url || images[0]?.video_url);

    setActiveThumbnail(firstMedia);
    setMainImage(firstMedia);
    setThumbStart(0);
    setMobileSlide(0);
  }

  useEffect(() => {
    if (images.length > 0) {
      images.forEach((img) => {
        const url = safeUrl(img.image_url || img.video_url);

        if (url && !isYouTubeUrl(url) && !loadedUrlsRef.current.has(url)) {
          const preImg = new window.Image();

          preImg.src = url;

          preImg.onload = () => markLoaded(url);
        }
      });
    }
  }, [images, markLoaded]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - left) / width) * 100;

    const y = ((e.clientY - top) / height) * 100;

    setMousePosition({ x, y });
  };

  const handleThumbnailClick = useCallback(
    (mediaUrl: string, index: number) => {
      const safeMedia = safeUrl(mediaUrl);

      setActiveThumbnail(safeMedia);
      setMainImage(safeMedia);

      sliderRef.current?.goToSlide(index);
    },
    [],
  );

  const shimmerStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite, fadeIn 0.4s 0.2s forwards",
    borderRadius: 4,
    zIndex: 1,
    opacity: 0,
  };

  return (
    <>
      <div className="hidden xl:flex w-full h-full items-stretch gap-4">
        <div className="flex flex-col items-center justify-center h-[700px] shrink-0">
          <button
            className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-white text-black shrink-0 cursor-pointer transition-colors hover:bg-gray-100 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => {
              const currentActiveIndex = images.findIndex(
                (img) =>
                  safeUrl(img.image_url || img.video_url) === activeThumbnail,
              );

              const prevIndex =
                currentActiveIndex <= 0
                  ? images.length - 1
                  : currentActiveIndex - 1;

              const prevItem = images[prevIndex];

              const prevUrl = safeUrl(
                prevItem?.image_url || prevItem?.video_url,
              );

              handleThumbnailClick(prevUrl, prevIndex);

              setThumbStart(() => {
                if (currentActiveIndex <= 0) {
                  return Math.max(0, images.length - THUMBS_VISIBLE);
                }

                return Math.min(prevIndex, thumbStart);
              });
            }}
            aria-label="Scroll thumbnails up"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>

          <div className="flex-1 flex py-2 h-full items-start overflow-hidden">
            <div
              className="flex flex-col gap-2 w-[100px] overflow-y-auto overscroll-contain"
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
            >
              {images
                .slice(thumbStart, thumbStart + THUMBS_VISIBLE)
                .map((item, i) => {
                  const originalIndex = thumbStart + i;
                  const mediaUrl = safeUrl(item?.image_url || item?.video_url);
                  const isActive = activeThumbnail === mediaUrl;

                  return (
                    <div
                      key={mediaUrl + originalIndex}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        handleThumbnailClick(mediaUrl, originalIndex)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleThumbnailClick(mediaUrl, originalIndex);
                        }
                      }}
                      className={`w-full h-[70px] shrink-0 border overflow-hidden relative flex items-center justify-center cursor-pointer rounded-[5px] bg-white transition-shadow ${
                        isActive
                          ? "border-[#fd151b] shadow-[3px_3px_5px_#cccccc]"
                          : "border-gray-200"
                      }`}
                    >
                      {item?.video_url && !item?.image_url ? (
                        isYouTubeUrl(mediaUrl) ? (
                          <div className="w-full h-full relative bg-white">
                            <iframe
                              src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                                mediaUrl,
                              )}?autoplay=0&controls=0&mute=1`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              title="YouTube video player"
                              className="absolute inset-0 w-full h-full object-cover scale-[1.35]"
                            />
                          </div>
                        ) : (
                          <video
                            src={mediaUrl}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        )
                      ) : (
                        <>
                          {!isLoaded(mediaUrl) && <div style={shimmerStyle} />}

                          <Image
                            src={mediaUrl}
                            alt={`thumbnail-${originalIndex}`}
                            width={100}
                            height={100}
                            className="object-cover w-full h-full"
                            onLoad={() => markLoaded(mediaUrl)}
                            style={{
                              opacity: isLoaded(mediaUrl) ? 1 : 0,
                              transition: "opacity 0.3s ease",
                            }}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          <button
            className=" flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-white text-black shrink-0 cursor-pointer transition-colors hover:bg-gray-100 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed z-10"
            onClick={() => {
              const currentActiveIndex = images.findIndex(
                (img) =>
                  safeUrl(img.image_url || img.video_url) === activeThumbnail,
              );

              const nextIndex =
                currentActiveIndex >= images.length - 1
                  ? 0
                  : currentActiveIndex + 1;

              const nextItem = images[nextIndex];
              const nextUrl = safeUrl(
                nextItem?.image_url || nextItem?.video_url,
              );

              handleThumbnailClick(nextUrl, nextIndex);

              setThumbStart(() => {
                if (currentActiveIndex >= images.length - 1) {
                  return 0;
                }

                const maxStart = Math.max(0, images.length - THUMBS_VISIBLE);

                return Math.min(
                  maxStart,
                  nextIndex >= thumbStart + THUMBS_VISIBLE
                    ? thumbStart + 1
                    : thumbStart,
                );
              });
            }}
            aria-label="Scroll thumbnails down"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        <div
          className="relative flex-1 h-full overflow-hidden rounded-[15px]  bg-white"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
        >
          {onWishlistToggle && (
            <button
              type="button"
              onClick={onWishlistToggle}
              disabled={isWishlistLoading}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md z-20 transition-all hover:scale-105 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed border border-[#E0E0E0] cursor-pointer"
            >
              <Heart
                className="h-5 w-5"
                fill={isWishlisted ? "#FD151B" : "none"}
                stroke={isWishlisted ? "#FD151B" : "#012A61"}
                strokeWidth={2}
              />
            </button>
          )}

          {mainImage &&
          images.find(
            (img) => safeUrl(img.image_url || img.video_url) === mainImage,
          )?.video_url &&
          !images.find(
            (img) => safeUrl(img.image_url || img.video_url) === mainImage,
          )?.image_url ? (
            isYouTubeUrl(mainImage) ? (
              <div className="w-full h-full absolute inset-0 bg-white">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                    mainImage,
                  )}?autoplay=1&mute=1&rel=0`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube video player"
                  className="w-full h-full object-cover rounded-[15px]"
                ></iframe>
              </div>
            ) : (
              <video
                src={mainImage}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover absolute inset-0 rounded-[15px]"
                style={{
                  transform: isHovered ? "scale(1.1)" : "scale(1)",
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                  transition: "transform 0.2s ease-out",
                }}
              />
            )
          ) : (
            <>
              {!isLoaded(mainImage) && <div style={shimmerStyle} />}

              <Image
                src={safeUrl(mainImage)}
                alt={product.title || "Product Image"}
                width={700}
                height={700}
                onLoad={() => markLoaded(mainImage)}
                onClick={() => openPreview(mainImage)}
                className="absolute inset-0 w-full h-full rounded-[15px] object-cover"
                style={{
                  transform: isHovered ? "scale(1.5)" : "scale(1)",
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                  transition: isLoaded(mainImage)
                    ? "transform 0.2s ease-out"
                    : "none",
                  cursor: "zoom-in",
                  opacity: isLoaded(mainImage) ? 1 : 0,
                }}
              />
            </>
          )}
        </div>
      </div>

      <div className="xl:hidden">
        <div className="relative">
          {onWishlistToggle && (
            <button
              type="button"
              onClick={onWishlistToggle}
              disabled={isWishlistLoading}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md z-20 transition-all hover:scale-105 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed border border-[#E0E0E0]"
            >
              <Heart
                className="h-4 w-4"
                fill={isWishlisted ? "#FD151B" : "none"}
                stroke={isWishlisted ? "#FD151B" : "#012A61"}
                strokeWidth={2}
              />
            </button>
          )}

          <ReusableSlider
            ref={sliderRef}
            items={images}
            slidesToShow={1}
            slidesToScroll={1}
            gap={0}
            breakpoints={{ 0: { slidesPerView: 1, spaceBetween: 0 } }}
            infinite={true}
            centered={true}
            speed={500}
            arrows={false}
            pauseOnHover={true}
            onSlideChange={(slideIndex) => setMobileSlide(slideIndex)}
            renderItem={(item, index) => (
              <div
                className="relative w-full h-[320px] sm:h-[380px] overflow-hidden rounded-[15px] flex items-center  xl:justify-center"
                key={item.image_url || item.video_url}
              >
                {item?.video_url && !item?.image_url ? (
                  isYouTubeUrl(safeUrl(item.video_url)) ? (
                    <div className="w-full h-full absolute inset-0">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                          safeUrl(item.video_url),
                        )}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube video player"
                        className="w-full h-full object-cover"
                      ></iframe>
                    </div>
                  ) : (
                    <video
                      src={safeUrl(item.video_url)}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <>
                    {!isLoaded(safeUrl(item.image_url)) && (
                      <div style={shimmerStyle} />
                    )}

                    <Image
                      src={safeUrl(item.image_url)}
                      alt={`slide-${index}`}
                      width={400}
                      height={360}
                      draggable={false}
                      onLoad={() => markLoaded(safeUrl(item.image_url))}
                      onClick={() => openPreview(safeUrl(item.image_url))}
                      className="w-full h-full object-contain rounded-[15px]"
                      style={{
                        opacity: isLoaded(safeUrl(item.image_url)) ? 1 : 0,
                        transition: "opacity 0.3s ease",
                      }}
                    />
                  </>
                )}
              </div>
            )}
          />
        </div>

        {images.length > 1 && (
          <div className="flex items-center justify-center gap-[6px] pt-3">
            {images.map((item, index) => (
              <button
                key={item.image_url || item.video_url || index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => sliderRef.current?.goToSlide(index)}
                className={`rounded-full transition-all duration-200 ${
                  index === mobileSlide
                    ? "w-[8px] h-[8px] bg-[#fd151b]"
                    : "w-[6px] h-[6px] bg-[#D9D9D9]"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <ImagePreviewModal
        open={isPreviewOpen}
        onClose={closePreview}
        images={images}
        initialUrl={previewUrl}
        title={product.title || ""}
      />
    </>
  );
};

export default ProductGallery;
