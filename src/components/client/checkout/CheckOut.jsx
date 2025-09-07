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
import { ArrowLeftOutlined } from "@ant-design/icons";

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
    <>
      <div className="max-w-4xl">
        <Link to="/cart">
          <ArrowLeftOutlined /> Trở lại{" "}
        </Link>
      </div>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-2xl">
        <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

        {/* 1. Thông tin hóa đơn */}
        <div className="border-b pb-4 mb-6">
          <h2 className="text-xl font-semibold mb-3">Thông tin hóa đơn</h2>
          {discountData ? (
            <div className="space-y-2">
              <p>
                <strong>Tổng tiền:</strong> {discountData.totalPrice || 0} đ
              </p>
              <p>
                <strong>Mã Giãm Giá:</strong> {discountData.discountCode || ""}
              </p>
              <p>
                <strong>Giảm giá:</strong> {discountData.discount || "Không có"}
              </p>
              <p>
                <strong>Tổng sau giảm:</strong>{" "}
                {Number(
                  discountData.totalAfterDiscount || discountData.totalPrice
                )?.toLocaleString()}{" "}
                đ
              </p>
            </div>
          ) : (
            <p>Không có thông tin giảm giá</p>
          )}
        </div>

        {/* 2. Địa chỉ giao hàng */}
        <div className="border-b pb-4 mb-6">
          <h2 className="text-xl font-semibold mb-3">Địa chỉ giao hàng</h2>
          <input
            type="text"
            placeholder="Số nhà, tên đường..."
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            className="w-full p-2 border rounded-lg mb-3"
          />

          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="w-full p-2 border rounded-lg mb-3"
          >
            <option value="">Chọn tỉnh / thành phố</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full p-2 border rounded-lg mb-3"
            disabled={!districts.length}
          >
            <option value="">Chọn quận / huyện</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="w-full p-2 border rounded-lg"
            disabled={!wards.length}
          >
            <option value="">Chọn xã / phường</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Phương thức thanh toán */}
        <div className="border-b pb-4 mb-6">
          <h2 className="text-xl font-semibold mb-3">Phương thức thanh toán</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Thanh toán khi nhận hàng (COD)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="bank"
                checked={paymentMethod === "bank"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Chuyển khoản ngân hàng</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="wallet"
                checked={paymentMethod === "wallet"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Ví điện tử (Momo, ZaloPay, VNPay...)</span>
            </label>
          </div>
        </div>

        {/* 4. Nút đặt hàng */}
        {/* <button
        onClick={handlePlaceOrder}
        className="w-full py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition"
      >
        Đặt hàng
      </button> */}

        <Button
          onClick={handlePlaceOrder}
          loading={isLoading}
          style={{
            border: "none",
            width: "100%",
            marginTop: "16px",
            backgroundColor: "#b91c1c", // red-700
            color: "#fff",
            padding: "12px 0",
            height: "40px",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#ef4444")
          } // red-500
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#b91c1c")
          }
        >
          Đặt hàng
        </Button>
      </div>
    </>
  );
};
