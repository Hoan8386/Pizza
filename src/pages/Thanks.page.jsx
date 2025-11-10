import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

export default function ThanksPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const responseCode = params.get("vnp_ResponseCode");
  const txnRef = params.get("vnp_TxnRef");
  const message = params.get("vnp_Message") || params.get("message");

  useEffect(() => {
    // You may call backend to verify payment status by txnRef here.
    // e.g., GET /api/payments?txnRef=... or a dedicated endpoint.
  }, [txnRef]);

  const success = responseCode === "00";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl w-full bg-white rounded-xl shadow p-8 text-center">
        <h1
          className={`text-3xl font-bold mb-4 ${
            success ? "text-green-600" : "text-red-600"
          }`}
        >
          {success ? "Thanh toán thành công" : "Thanh toán không thành công"}
        </h1>
        <p className="text-gray-700 mb-4">
          {message ||
            (success
              ? "Cảm ơn bạn. Đơn hàng đã được xử lý."
              : "Giao dịch bị huỷ hoặc thất bại.")}
        </p>
        {txnRef && (
          <p className="text-sm text-gray-500 mb-4">Mã tham chiếu: {txnRef}</p>
        )}

        <div className="flex justify-center gap-4">
          <Link to="/" className="px-6 py-2 bg-gray-200 rounded-md">
            Quay về trang chủ
          </Link>
          <Link
            to="/order"
            className="px-6 py-2 bg-red-600 text-white rounded-md"
          >
            Xem đơn hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
