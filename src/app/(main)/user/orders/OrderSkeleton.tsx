const OrderBlockSkeleton = () => {
  return (
    <div className="order-block mt-30 animate-pulse">
      <div className="dflex order-detail">
        {/* Order Info */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="order-item" key={i}>
            <h5 className="bg-gray-300 h-4 w-24 rounded"></h5>
            <p className="bg-gray-200 h-3 w-32 mt-2 rounded"></p>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <table className="cart-table order-table">
        <tbody>
          {Array.from({ length: 2 }).map((_, i) => (
            <tr key={i}>
              <td className="item-info flex gap-4">
                <div className="w-[136px] h-[136px] bg-gray-200 rounded"></div>

                {/* Content */}
                <div className="flex flex-col gap-2 w-full">
                  <div className="h-4 bg-gray-300 w-1/3 rounded"></div>
                  <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
                  <div className="h-3 bg-gray-200 w-1/4 rounded"></div>
                  <div className="h-3 bg-gray-200 w-1/3 rounded"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Buttons Skeleton */}
      <div className="dflex order-action justify-between mt-4">
        <div className="btn-action flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-28 bg-gray-300 rounded"
            ></div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-28 bg-gray-300 rounded"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default OrderBlockSkeleton;