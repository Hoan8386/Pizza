import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/auth.context";
import {
  checkOutApi,
  createOrder,
  getCart,
} from "../../../services/api.service";
import { toast } from "react-toastify";
import { Button } from "antd";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  CreditCardOutlined,
  BankOutlined,
  WalletOutlined,
  TagOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

export const CheckOut = () => {
  const location = useLocation();
  const discountData = location.state;

  // Địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const navigate = useNavigate();
  const { setCart } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);

  // Thanh toán
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // const { user } = useContext(AuthContext);
  // Lấy danh sách tỉnh
  useEffect(() => {
    axios.get("https://provinces.open-api.vn/api/?depth=1").then((res) => {
      setProvinces(res.data);
    });
  }, []);

  // Lấy danh sách huyện khi chọn tỉnh
  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((res) => {
          setDistricts(res.data.districts);
          setWards([]);
          setSelectedDistrict("");
          setSelectedWard("");
        });
    }
  }, [selectedProvince]);

  // Lấy danh sách xã khi chọn huyện
  useEffect(() => {
    if (selectedDistrict) {
      axios
        .get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((res) => {
          setWards(res.data.wards);
          setSelectedWard("");
        });
    }
  }, [selectedDistrict]);

  const fetchCart = async () => {
    const res = await getCart();
    if (res.data) {
      setCart({
        id: res.data.cart.id,
        user_id: res.data.cart.user_id,
        totalItems: res.data.items.length,
        totalPrice: res.data.total,
        items: res.data.items,
      });
    }
  };

  // đặt hàng
  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      if (
        !detailAddress ||
        !selectedProvince ||
        !selectedDistrict ||
        !selectedWard
      ) {
        toast.warning("Vui lòng nhập đầy đủ địa chỉ");
        return;
      }

      const fullAddress = `${detailAddress}, ${
        wards.find((w) => w.code === +selectedWard)?.name || ""
      }, ${districts.find((d) => d.code === +selectedDistrict)?.name || ""}, ${
        provinces.find((p) => p.code === +selectedProvince)?.name || ""
      }`;

      // Gọi tạo đơn hàng + thanh toán
      const orderRes = await createOrder(
        fullAddress,
        discountData?.discountCode
      );

      if (orderRes?.data?.id) {
        const paymentRes = await checkOutApi(
          orderRes.data.id,
          orderRes.data.total_amount,
          paymentMethod
        );

        if (!paymentRes?.data?.error) {
          toast.success("Thanh toán thành công");
          fetchCart();
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          toast.error("Thanh toán thất bại");
        }
      } else {
        toast.error("Thanh toán thất bại");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Thanh toán thất bại");
    }
    setIsLoading(false);
  };

  // };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeftOutlined />
            <span className="font-medium">Quay lại giỏ hàng</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Địa chỉ giao hàng */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <EnvironmentOutlined className="text-red-600 text-lg" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Địa chỉ giao hàng
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số nhà, tên đường <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 123 Nguyễn Văn Linh"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition appearance-none bg-white"
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition appearance-none bg-white disabled:bg-gray-100"
                      disabled={!districts.length}
                    >
                      <option value="">Chọn quận/huyện</option>
                      {districts.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition appearance-none bg-white disabled:bg-gray-100"
                      disabled={!wards.length}
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCardOutlined className="text-green-600 text-lg" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Phương thức thanh toán
                </h2>
              </div>

              <div className="space-y-3">
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-red-600"
                  />
                  <HomeOutlined className="text-2xl text-gray-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      Thanh toán khi nhận hàng
                    </div>
                    <div className="text-sm text-gray-500">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "bank"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === "bank"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-red-600"
                  />
                  <BankOutlined className="text-2xl text-gray-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      Chuyển khoản ngân hàng
                    </div>
                    <div className="text-sm text-gray-500">
                      Chuyển khoản qua các ngân hàng
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "wallet"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === "wallet"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-red-600"
                  />
                  <WalletOutlined className="text-2xl text-gray-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      Ví điện tử
                    </div>
                    <div className="text-sm text-gray-500">
                      Momo, ZaloPay, VNPay...
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-5">
                Thông tin đơn hàng
              </h2>

              {discountData ? (
                <div className="space-y-4">
                  {/* Tạm tính */}
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-semibold text-gray-800">
                      {Number(discountData.totalPrice || 0).toLocaleString()} ₫
                    </span>
                  </div>

                  {/* Mã giảm giá */}
                  {discountData.discountCode && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <TagOutlined className="text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Mã giảm giá
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 ml-6">
                        {discountData.discountCode}
                      </div>
                    </div>
                  )}

                  {/* Giảm giá */}
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Giảm giá</span>
                    <span className="font-semibold text-green-600">
                      -{Number(discountData.discount || 0).toLocaleString()} ₫
                    </span>
                  </div>

                  {/* Phí giao hàng */}
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Phí giao hàng</span>
                    <span className="font-semibold text-gray-800">
                      Miễn phí
                    </span>
                  </div>

                  {/* Tổng cộng */}
                  <div className="bg-red-50 rounded-xl p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">
                        Tổng cộng
                      </span>
                      <span className="text-2xl font-bold text-red-600">
                        {Number(
                          discountData.totalAfterDiscount ||
                            discountData.totalPrice ||
                            0
                        ).toLocaleString()}{" "}
                        ₫
                      </span>
                    </div>
                  </div>

                  {/* Nút đặt hàng */}
                  <Button
                    onClick={handlePlaceOrder}
                    loading={isLoading}
                    className="w-full mt-6 h-12 text-base font-semibold"
                    type="primary"
                    size="large"
                    style={{
                      backgroundColor: "#b91c1c",
                      borderColor: "#b91c1c",
                      borderRadius: "12px",
                    }}
                  >
                    Đặt hàng ngay
                  </Button>

                  {/* Lưu ý */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 text-center">
                      Bằng việc tiến hành đặt hàng, bạn đồng ý với{" "}
                      <span className="text-red-600 font-medium">
                        Điều khoản dịch vụ
                      </span>{" "}
                      và{" "}
                      <span className="text-red-600 font-medium">
                        Chính sách bảo mật
                      </span>{" "}
                      của chúng tôi
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Không có thông tin đơn hàng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
