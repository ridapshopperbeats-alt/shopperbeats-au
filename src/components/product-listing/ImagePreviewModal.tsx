import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { ProductImage } from "@/types/product";

interface ImagePreviewModalProps {
  open: boolean;
  onClose: () => void;
  images: ProductImage[];
  initialUrl: string;
  title: string;
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

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  open,
  onClose,
  images,
  initialUrl,
  title,
}) => {
  const [selectedUrl, setSelectedUrl] = useState<string>(safeUrl(initialUrl));

  // Reset the selected media whenever the modal opens (or is re-opened with a
  // new initial URL while already open). Adjusted directly during render
  // (React's recommended pattern for state that derives from a changed prop,
  // using state rather than a ref so it stays safe to read during render)
  // instead of inside an effect, to avoid an extra render pass.
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevInitialUrl, setPrevInitialUrl] = useState(initialUrl);

  if (open !== prevOpen || initialUrl !== prevInitialUrl) {
    setPrevOpen(open);
    setPrevInitialUrl(initialUrl);

    if (open) {
      setSelectedUrl(safeUrl(initialUrl));
    }
  }

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.lenisInstance?.stop();

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.lenisInstance?.start();
    };
  }, [open]);

  if (!open) return null;

  const selectedItem = images.find(
    (img) => safeUrl(img.image_url || img.video_url) === selectedUrl,
  );

  const isVideo = !!selectedItem?.video_url && !selectedItem?.image_url;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-[1200]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-6">
        <div
          className="relative bg-white rounded-[15px] w-full max-w-[1700px] h-[92vh] sm:h-[88vh] lg:h-[85vh] xl:h-[800px] xl:max-h-[800px] flex flex-col lg:flex-row gap-5 lg:gap-6 xl:gap-10 p-4 sm:p-6 lg:p-6 xl:p-9 overflow-visible"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="absolute -top-3 -right-1 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-100 z-10"
          >
            <X size={18} strokeWidth={2} className="text-black" />
          </button>

          {/* LEFT: Main preview */}
          <div className="relative w-full h-[220px] sm:h-[320px] md:h-[420px] lg:w-1/2 lg:h-full xl:w-[800px] xl:h-[700px] shrink-0 rounded-[15px] overflow-hidden bg-white flex items-center justify-center">
            {isVideo ? (
              isYouTubeUrl(selectedUrl) ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                    selectedUrl,
                  )}?autoplay=0&rel=0`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube video player"
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              ) : (
                <video
                  src={selectedUrl}
                  controls
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )
            ) : (
              <Image
                src={selectedUrl}
                alt={title || "Product Image"}
                fill
                sizes="(min-width: 1280px) 800px, 100vw"
                className="object-contain"
              />
            )}
          </div>

          <div className="flex flex-col flex-1 min-w-0 ">
            <h2 className="text-black font-medium text-[20px] leading-[30px]">
              {title}
            </h2>

            <div
              className="flex flex-wrap gap-3 mt-4 overflow-y-auto pr-1"
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
            >
              {images.map((item, index) => {
                const mediaUrl = safeUrl(item?.image_url || item?.video_url);
                const isActive = mediaUrl === selectedUrl;
                const itemIsVideo = !!item?.video_url && !item?.image_url;

                return (
                  <div
                    key={mediaUrl + index}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedUrl(mediaUrl)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedUrl(mediaUrl);
                      }
                    }}
                    className={`w-[100px] h-[110px] rounded-[5px] border overflow-hidden relative cursor-pointer shrink-0 bg-white transition-colors ${
                      isActive ? "border-[#fd151b] border-2" : "border-gray-300"
                    }`}
                  >
                    {itemIsVideo && isYouTubeUrl(mediaUrl) ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                          mediaUrl,
                        )}?autoplay=0&controls=0&mute=1`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title={`preview-thumb-${index}`}
                        className="absolute inset-0 w-full h-full object-cover scale-[1.35]"
                      ></iframe>
                    ) : itemIsVideo ? (
                      <video
                        src={mediaUrl}
                        className="img-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <Image
                        src={mediaUrl}
                        alt={`preview-thumb-${index}`}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImagePreviewModal;
