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
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center px-4">
        <div className="relative w-[calc(100%+32px)] -mx-4 lg:mx-0 lg:w-full lg:max-w-[430px] min-h-[237px] bg-white rounded-t-[24px] lg:rounded-[15px] shadow-[0px_0px_10px_0px_#00000033] overflow-hidden lg:overflow-visible px-6 lg:px-8 pt-2 lg:pt-8 pb-6 lg:pb-8">
          <div className="flex lg:hidden justify-center pb-2">
            <span className="w-9 h-1 rounded-full bg-[#D9D2D2]" />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute bg-white/90 w-8 h-8 text-black flex items-center justify-center p-1 rounded-full top-3 right-4 lg:-top-4 lg:-right-2 cursor-pointer shadow-[0_0px_10px_0_#0000001F]"
          >
            <X size={18} strokeWidth={1.5} className="text-center" />
          </button>

          <h3 className="text-[16px] font-bold text-black"> Size Guide</h3>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-[13px] text-left border border-collapse border-[#F0F0F0]">
              <thead>
                <tr>
                  {["Size", "Bust", "Waist", "Hip", "Length"].map((label) => (
                    <th
                      key={label}
                      className="font-semibold text-black py-2 px-2 whitespace-nowrap border border-[#E2E2E2] bg-[#F2F2F2]"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE_ROWS.map((row) => (
                  <tr key={row.size}>
                    <td className="py-2 px-2 font-medium text-black border border-[#F0F0F0]">
                      {row.size}
                    </td>
                    <td className="py-2 px-2 text-[#696e79] border border-[#F0F0F0]">{row.bust}</td>
                    <td className="py-2 px-2 text-[#696e79] border border-[#F0F0F0]">{row.waist}</td>
                    <td className="py-2 px-2 text-[#696e79] border border-[#F0F0F0]">{row.hip}</td>
                    <td className="py-2 px-2 text-[#696e79] border border-[#F0F0F0]">{row.length}</td>
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
