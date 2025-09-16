import { MinusOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";
import { useContext, useState } from "react";
import { apiAddCart, getCart } from "../../../services/api.service";
import { AuthContext } from "../../context/auth.context";
import { Button } from "antd";
import { toast } from "react-toastify";

export const ModelProduct = ({ product, onClose }) => {
  const { setCart, user } = useContext(AuthContext);
  console.log("check product", product);
  // Lấy variants
  const variants = product.product_variants || [];

  // Kiểm tra có size/crust hay không
  const hasVariants = variants.some((v) => v.size || v.crust);

  // Nếu có size thì lấy danh sách size
  const sizes = hasVariants
    ? [
        ...new Map(
          variants.map((v) => [v.size?.id, v.size]).filter(([size]) => size)
        ).values(),
      ]
    : [];

  const [selectedSize, setSelectedSize] = useState(sizes[0] || null);

  // Nếu có size thì lọc crust theo size, còn không thì để rỗng
  const crusts = selectedSize
    ? variants.filter((v) => v.size?.id === selectedSize.id)
    : [];

  const [selectedCrust, setSelectedCrust] = useState(crusts[0] || variants[0]);

  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Nếu có size + crust thì lấy đúng variant, nếu không thì lấy thẳng variant đầu tiên
  const variant = hasVariants
    ? variants.find(
        (v) =>
          v.size?.id === selectedSize?.id &&
          v.crust?.id === selectedCrust?.crust?.id
      )
    : variants[0];

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

  const addItem = async () => {
    console.log("check user", user);
    if (user.id != null) {
      if (!variant) {
        toast.error("Không tìm thấy sản phẩm hợp lệ!");
        return;
      }
      setIsLoading(true);
      await apiAddCart(variant.id, quantity);
      fetchCart();
      toast.success("Thêm sản phẩm vào giỏ hàng thành công");
      setIsLoading(false);
    } else {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[62%] h-[640px] overflow-y-auto relative ">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-8 text-gray-500 hover:text-black"
        >
          <CloseOutlined />
        </button>

        <div className="h-full w-full flex">
          {/* Ảnh bên trái */}
          <div className="h-full w-[40%] overflow-hidden">
            <div className="w-[112%] h-[130%] relative">
              <img
                src={`http://localhost:8000/images${product.image_url}`}
                alt="food"
                className="w-[100%] h-[100%] object-cover object-right absolute"
                style={{ top: "-10%" }}
              />
            </div>
          </div>

          {/* Nội dung bên phải */}
          <div className="pl-4 flex flex-col w-[60%]">
            <div
              className="px-2"
              style={{
                height: "calc(100% - 100px)",
                overflow: "scroll",
                overflowX: "hidden",
              }}
            >
              {/* Tên + mô tả */}
              <h2 className="text-2xl font-bold pr-4 mt-4">{product.name}</h2>
              <p className="text-gray-600 mt-2 pr-4">{product.description}</p>

              {/* Nếu có size thì hiển thị size */}
              {hasVariants && sizes.length > 0 && (
                <div className="mt-6 pr-4">
                  <h3 className="font-semibold mb-2">Kích thước</h3>
                  <div className="flex rounded-lg overflow-hidden">
                    {sizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => {
                          setSelectedSize(size);
                          setSelectedCrust(
                            product.product_variants.find(
                              (v) => v.size?.id === size.id
                            )
                          );
                        }}
                        className={`flex-1 px-6 py-2 text-center hover:bg-red-700 hover:text-white ${
                          selectedSize?.id === size.id
                            ? "bg-red-700 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nếu có crust thì hiển thị đế bánh */}
              {hasVariants && crusts.length > 0 && (
                <div className="mt-6 pr-4">
                  <h3 className="font-semibold mb-2">Đế bánh</h3>
                  <div className="space-y-3">
                    {crusts.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="crust"
                            checked={selectedCrust?.id === c.id}
                            onChange={() => setSelectedCrust(c)}
                            className="w-4 h-4"
                          />
                          <span>
                            {c.crust?.name} ({c.size?.name})
                          </span>
                        </div>
                        <span className="font-semibold">
                          {Number(c.price).toLocaleString()} đ
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Nếu không có size/crust thì chỉ hiển thị giá */}
              {!hasVariants && variant && (
                <div className="mt-6 pr-4">
                  <h3 className="font-semibold mb-2">Giá</h3>
                  <p className="text-xl font-bold text-red-700">
                    {Number(variant.price).toLocaleString()} đ
                  </p>
                </div>
              )}
            </div>

            {/* Số lượng + nút thêm */}
            <div className="mt-6 flex items-center gap-4 pr-6">
              <div className="flex items-center">
                <button
                  className="px-3 py-1 text-lg border rounded-lg text-red-700 border-gray-300"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <MinusOutlined />
                </button>
                <span className="px-4">{quantity}</span>
                <button
                  className="px-3 py-1 text-lg border rounded-lg text-red-700 border-gray-300"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <PlusOutlined />
                </button>
              </div>

              <Button
                onClick={addItem}
                style={{
                  backgroundColor: "rgb(200 16 46)",
                  color: "white",
                  border: "none",
                  fontSize: "16px",
                  height: "40px",
                  width: "100%",
                }}
                loading={isLoading}
              >
                Thêm vào giỏ hàng •{" "}
                {variant
                  ? (Number(variant.price) * quantity).toLocaleString()
                  : 0}{" "}
                đ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
