import { useContext, useEffect, useState } from "react";
import {
  deleteCartApi,
  getCartApi,
  getCoupon,
  updateCartApi,
} from "../services/api.service";
import {
  ArrowLeftOutlined,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Input, InputNumber, Modal } from "antd";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../components/context/auth.context";

export const CartPage = () => {
  const [products, setProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState();
  const [isDisabled, setIsDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [couponCode, setCouponCode] = useState();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [imageLoaded, setImageLoaded] = useState({});
  const { setCart } = useContext(AuthContext);

  const handleImageLoad = (itemId) => {
    setImageLoaded((prev) => ({ ...prev, [itemId]: true }));
  };

  const fetchData = async () => {
    setIsLoadingCart(true);
    try {
      const res = await getCartApi();
      setProducts(res.data.items); // Adjust based on API response
      setTotalPrice(res.data.total); // Adjust based on API response
      setCart({
        id: res.data.cart.id,
        user_id: res.data.cart.user_id,
        totalItems: res.data.items.length,
        totalPrice: res.data.total,
        items: res.data.items,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoadingCart(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveFromCart = (id) => {
    setDeleteId(id);
    setIsModalOpen(true);
  };

  const removeItem = async () => {
    try {
      await deleteCartApi(deleteId);
      fetchData();
      toast.success("Xóa sản phẩm thành công");
    } catch (e) {
      console.error("Failed to remove item:", e);
    } finally {
      setIsModalOpen(false);
      setDeleteId(null);
    }
  };

  // Function to update quantity
  const updateQuantity = async (id, quantity) => {
    setIsDisabled(true);
    try {
      await updateCartApi(id, quantity); // Call API to update cart
      fetchData();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
    setIsDisabled(false);
  };
  const [coupon, setCoupon] = useState();
  const [discount, setDiscount] = useState();

  const [totalAfterDiscount, setTotalAfterDiscount] = useState("");

  const checkCoupon = async () => {
    if (products.length === 0) {
      toast.warning("Không có sản phẩm nào");
      return;
    }

    if (!coupon || coupon.trim() === "") {
      toast.warning("Vui lòng nhập mã giảm giá");
      return;
    }

    setIsLoading(true);
    try {
      const res = await getCoupon(coupon, totalPrice);
      console.log("check ", res);

      // Kiểm tra status code 400 hoặc valid === false
      if (res.statusCode === 400 || res.valid === false) {
        toast.error(res.message);
      } else if (res.data && res.data.valid === true) {
        toast.success("Áp dụng mã giảm giá thành công");
        setTotalAfterDiscount(totalPrice - res.data.discount);
        setDiscount(res.data.discount);
        setCouponCode(res.data.coupon.code);
        console.log("check code ", res.data.coupon.code);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error checking coupon:", error);
      toast.error("Invalid or expired coupon");
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscount(0);
    setTotalAfterDiscount("");
    setCoupon("");
    toast.success("Đã hủy mã giảm giá");
  };

  const checkout = () => {
    if (products.length === 0) {
      toast.warning("Không có sản phẩm nào");
    } else {
      setIsLoading(true);
      const discountData = {
        discount: discount,
        totalAfterDiscount: totalAfterDiscount,
        totalPrice: totalPrice,
        discountCode: couponCode,
      };
      setIsLoading(false);

      // Điều hướng sang Checkout kèm dữ liệu
      navigate("/checkout", { state: discountData });
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <div className="flex-1">
          <Link to="/">
            <ArrowLeftOutlined /> Trở lại
          </Link>
        </div>
        <div className="flex-2 md:py-6 ">
          <p className="text-base text-center md:text-3xl font-semibold md:font-bold whitespace-pre overflow-hidden text-ellipsis">
            Giỏ hàng của tôi
          </p>
        </div>
        <div className="flex-1"></div>
      </div>
      <div className="flex gap-4">
        <div className="flex-2 border border-gray-200 px-4 md:rounded-2xl">
          <p className="text-sm text-left text-black py-4 md:py-6 font-semibold md:text-base">
            Có {products.length} sản phẩm trong giỏ hàng của bạn
          </p>

          {isLoadingCart ? (
            <div className="flex flex-col gap-4 py-8">
              {[1, 2, 3].map((skeleton) => (
                <div
                  key={skeleton}
                  className="flex items-center border border-gray-200 rounded-2xl p-4 bg-white animate-pulse"
                >
                  <div className="w-[100px] h-[100px] bg-gray-300 rounded-xl"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-20 h-10 bg-gray-300 rounded"></div>
                    <div className="w-24 h-10 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {products.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center border border-gray-200 rounded-2xl p-4 mb-4 bg-white"
                >
                  {/* Column 1: Image + Info */}
                  <div className="flex flex-1 items-center">
                    <div className="w-[100px] h-[100px] flex-shrink-0 overflow-hidden rounded-xl relative bg-gray-200">
                      {!imageLoaded[item.id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                        </div>
                      )}
                      <img
                        src={`http://localhost:8000/images${item.image_url}`}
                        alt={
                          item.type === "product"
                            ? item.product_name
                            : item.combo_name
                        }
                        onLoad={() => handleImageLoad(item.id)}
                        className="w-full h-full object-cover scale-110"
                        style={{
                          opacity: imageLoaded[item.id] ? 1 : 0,
                          transition: "opacity 0.3s ease-in-out",
                        }}
                      />
                    </div>{" "}
                    <div className="ml-4">
                      {/* Tên hiển thị */}
                      <h6 className="text-lg md:text-xl font-semibold text-gray-800 line-clamp-2">
                        {item.type === "product"
                          ? item.product_name
                          : item.combo_name}
                      </h6>

                      {/* Nếu là product thì có size + crust */}
                      {item.type === "product" && (
                        <>
                          {item.variant_info?.size && (
                            <p
                              className="text-gray-500"
                              style={{ fontSize: "16px" }}
                            >
                              Cỡ: {item.variant_info.size}
                            </p>
                          )}
                          {item.variant_info?.crust && (
                            <p
                              className="text-gray-500"
                              style={{ fontSize: "16px" }}
                            >
                              Đế: {item.variant_info.crust}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Quantity + Price + Remove */}
                  <div className="flex-1 flex">
                    <InputNumber
                      style={{ width: "80px" }}
                      disabled={isDisabled}
                      min={1}
                      value={item.quantity}
                      onChange={(newQuantity) => {
                        if (!newQuantity || newQuantity < 1) return;
                        updateQuantity(item.id, newQuantity);
                      }}
                    />

                    {/* Price */}
                    <div className="flex-3 text-right pr-2">
                      <span className="text-lg font-semibold text-red-600">
                        {item.subtotal.toLocaleString()}₫
                      </span>
                    </div>

                    {/* Remove button */}
                    <div className="flex-1 text-right">
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 text-xl"
                      >
                        <CloseOutlined />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1  px-4 md:rounded-2xl">
          <div className="border border-gray-200 md:rounded-2xl md:p-6">
            <p className="text-base md:text-2xl font-semibold">Voucher</p>
            <p className="mt-4">Nhập hoặc chọn voucher của bạn</p>

            {/* Ô nhập mã voucher */}
            <div className="flex gap-2 mt-4">
              <input
                value={coupon}
                onChange={(e) => {
                  setCoupon(e.target.value);
                }}
                type="text"
                placeholder="Nhập mã voucher"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-red-500"
              />
              <div className="flex-1">
                <Button
                  loading={isLoading}
                  onClick={checkCoupon}
                  style={{
                    border: "none",
                    width: "100%",
                    backgroundColor: "#b91c1c", // red-700
                    color: "#fff",
                    padding: "12px 0",
                    height: "100%",
                    margin: "0",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ef4444")
                  } // red-500
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#b91c1c")
                  }
                >
                  Áp dụng
                </Button>
              </div>
            </div>

            {/* Hiển thị mã đã áp dụng */}
            {couponCode && (
              <div className="mt-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-medium">
                    ✓ Mã: {couponCode}
                  </span>
                  <span className="text-sm text-gray-600">
                    (Giảm {discount?.toLocaleString()} ₫)
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-red-600 hover:text-red-700 font-medium text-xl"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="border border-gray-200 md:rounded-2xl md:p-6 mt-4">
            {/* Tạm tính */}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Tạm tính</span>
              <span className="font-medium">
                {totalPrice?.toLocaleString()} ₫
              </span>
            </div>

            {/* Giảm giá thành viên */}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Giảm giá thành viên</span>
              <span className="font-medium">{discount} ₫</span>
            </div>

            {/* Phí giao hàng */}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Phí giao hàng</span>
              <span className="font-medium">0 ₫</span>
            </div>

            {/* Tổng cộng */}
            <div className="flex justify-between py-3 text-lg font-semibold text-red-600">
              <span>Tổng cộng</span>
              <span>
                {" "}
                {totalAfterDiscount === ""
                  ? totalPrice?.toLocaleString()
                  : totalAfterDiscount?.toLocaleString()}{" "}
                ₫
              </span>
            </div>

            <Button
              onClick={checkout}
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
              Thanh toán
            </Button>
          </div>

          {/* <Button>Thanh Toán</Button> */}
        </div>
      </div>

      <Modal
        title="Xác nhận xóa"
        open={isModalOpen} // (AntD v5 dùng 'open'; v4 là 'visible')
        centered
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        onOk={removeItem}
        onCancel={() => {
          setIsModalOpen(false);
          setDeleteId(null);
        }}
      >
        <p>Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?</p>
      </Modal>
    </>
  );
};
