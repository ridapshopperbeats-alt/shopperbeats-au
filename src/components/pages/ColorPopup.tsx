import { X } from "lucide-react";
import Image from "next/image";
import type { ColorPopupProps } from "@/types/product";



const ColorPopup = ({
  open,
  onClose,
  colors,
  selectedColor,
  onSelectColor,
}: ColorPopupProps) => {
  if (!open) return null;

  return (
    <>
      <div
        className="popup-backdrop"
        onClick={onClose}
      />

      <div className="popup-container">
        <div className="relative w-[calc(100%+32px)] -mx-4 lg:mx-0 lg:w-full lg:max-w-[430px] min-h-[237px] bg-white rounded-t-[24px] lg:rounded-[15px] shadow-[0px_0px_10px_0px_#00000033] overflow-hidden lg:overflow-visible px-6 lg:px-8 pt-2 lg:pt-8 pb-6 lg:pb-8">
          <div className="flex lg:hidden justify-center pb-2">
            <span className="popup-drag-handle" />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute bg-white/90 w-8 h-8 text-black flex items-center justify-center p-1 rounded-full top-3 right-4 lg:-top-4 lg:-right-2 cursor-pointer shadow-[0_0px_10px_0_#0000001F]"
          >
            <X size={18} strokeWidth={1.5} className="text-center" />
          </button>

          <h3 className="text-[16px] font-bold text-black">
            Color : {selectedColor}
          </h3>

          <div className="grid grid-cols-6 gap-3 mt-4">
            {colors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => onSelectColor(color.value)}
                disabled={(color.stock ?? 0) <= 0}
                aria-label={color.value}
                title={color.value}
                className={`w-[48px] h-[47px] rounded-full border border-black/10 overflow-hidden cursor-pointer transition-shadow disabled:opacity-40 disabled:cursor-not-allowed ${
                  selectedColor === color.value
                    ? "ring-2 ring-offset-2 ring-[#1D265F]"
                    : ""
                }`}
              >
                <Image
                  src={color.image}
                  alt={color.value}
                  width={48}
                  height={47}
                  className="img-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ColorPopup;

