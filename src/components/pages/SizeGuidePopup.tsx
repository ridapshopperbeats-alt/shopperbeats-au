import { X } from "lucide-react";

interface SizeGuidePopupProps {
  open: boolean;
  onClose: () => void;
}

const SIZE_GUIDE_ROWS = [
  { size: "XS", bust: 32, waist: 26, hip: 36, length: 46 },
  { size: "S", bust: 34, waist: 28, hip: 38, length: 46 },
  { size: "M", bust: 36, waist: 30, hip: 40, length: 47 },
  { size: "L", bust: 38, waist: 32, hip: 42, length: 47 },
  { size: "XL", bust: 40, waist: 34, hip: 44, length: 48 },
  { size: "XXL", bust: 42, waist: 36, hip: 46, length: 48 },
];

const SizeGuidePopup = ({ open, onClose }: SizeGuidePopupProps) => {
  if (!open) return null;

  return (
    <>
      <div className="popup-backdrop" onClick={onClose} />

      <div className="popup-container">
        <div className="relative w-[95vw] max-w-[580px] bg-white rounded-t-[24px] lg:rounded-[15px] shadow-[0px_0px_10px_0px_#00000033] px-6 lg:px-[30px] pt-4 lg:pt-6 pb-6 lg:pb-[30px]">
          {/* Mobile Drag Handle */}
          <div className="flex lg:hidden justify-center mb-3">
            <span className="popup-drag-handle" />
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-[0px_0px_10px_0px_#0000001F] top-3 right-3 lg:-top-5 lg:-right-5 cursor-pointer"
          >
            <X size={18} strokeWidth={1.8} />
          </button>

          {/* Heading */}
          <h3 className="text-[16px] font-bold text-black mb-5">Size Guide</h3>

          {/* Table */}
          <div className="overflow-hidden rounded-[2px] border border-[#E5E5E5]">
            <table className="w-full table-fixed border-collapse text-[13px]">
              <thead>
                <tr>
                  {["Size", "Bust", "Waist", "Hip", "Length"].map((label) => (
                    <th
                      key={label}
                      className="h-[38px] px-4 text-left font-semibold text-black bg-[#F5F5F5] border border-[#E5E5E5]"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {SIZE_GUIDE_ROWS.map((row) => (
                  <tr key={row.size}>
                    <td className="h-[38px] px-4 text-black font-medium border border-[#EAEAEA]">
                      {row.size}
                    </td>

                    <td className="h-[38px] px-4 text-[#6B7280] border border-[#EAEAEA]">
                      {row.bust}
                    </td>

                    <td className="h-[38px] px-4 text-[#6B7280] border border-[#EAEAEA]">
                      {row.waist}
                    </td>

                    <td className="h-[38px] px-4 text-[#6B7280] border border-[#EAEAEA]">
                      {row.hip}
                    </td>

                    <td className="h-[38px] px-4 text-[#6B7280] border border-[#EAEAEA]">
                      {row.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default SizeGuidePopup;
