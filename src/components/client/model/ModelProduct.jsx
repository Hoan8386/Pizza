import {
  XOutlined,
  MinusOutlined,
  PlusOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useContext, useState } from "react";
import pizza from "../../../assets/pizza/pizza.webp";
import { apiAddCart, getCart } from "../../../services/api.service";
import { AuthContext } from "../../context/auth.context";

export const ModelProduct = ({ product, onClose }) => {
  const { setCart } = useContext(AuthContext);
  // Lấy danh sách kích thước duy nhất từ product_variants
  const sizes = [
    ...new Map(
      product.product_variants.map((v) => [v.size.id, v.size])
    ).values(),
  ];

  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);

  // Lọc các crust theo size đang chọn
  const crusts = product.product_variants.filter(
    (v) => v.size.id === selectedSize.id
  );

  const [selectedCrust, setSelectedCrust] = useState(crusts[0]);

  const variant = product.product_variants.find(
    (v) =>
      v.size.id === selectedSize.id && v.crust.id === selectedCrust.crust.id
  );

  console.log("Variant tìm được:", variant);
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
    const res = await apiAddCart(variant.id, quantity);
    console.log("thêm sản phẩm thành công ", res);
    fetchCart();
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[62%]  h-[640px] overflow-y-auto relative ">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-8 text-gray-500 hover:text-black"
        >
          <CloseOutlined />
        </button>

        <div className=" h-full w-full flex">
          {/* Ảnh bên trái */}
          <div className="h-full w-[40%] overflow-hidden ">
            <div className="w-[112%] h-[130%] relative">
              <img
                src={pizza}
                alt="food"
                className="w-[100%] h-[100%] object-cover object-right absolute"
                style={{
                  top: "-10%",

                  marginRight: "",
                }}
              />
            </div>
          </div>

          {/* Nội dung bên phải */}
          <div className="pl-4 flex flex-col w-[60%]">
            <div
              className=" px-2"
              style={{
                height: "calc(100% - 100px)",
                overflow: "scroll",
                overflowX: "hidden",
              }}
            >
              {/* Tên + mô tả */}
              <h2 className="text-2xl font-bold pr-4 mt-4">{product.name}</h2>
              <p className="text-gray-600 mt-2 pr-4">{product.description}</p>

              {/* Tag */}
              <div className="mt-2 flex gap-2">
                <span className="text-white bg-red-700 px-2 rounded-md text-sm flex items-center">
                  New
                </span>
                <span className="text-gray-500 text-sm flex items-center">
                  Mới
                </span>
              </div>

              {/* Kích thước */}
              <div className="mt-6 pr-4">
                <h3 className="font-semibold mb-2">Kích thước</h3>
                <div className="flex rounded-lg overflow-hidden ">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => {
                        setSelectedSize(size);
                        setSelectedCrust(
                          product.product_variants.find(
                            (v) => v.size.id === size.id
                          )
                        );
                      }}
                      className={`flex-1 px-6 py-2 text-center hover:bg-red-700 hover:text-white  ${
                        selectedSize.id === size.id
                          ? "bg-red-700 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Đế bánh */}
              <div className="mt-6 pr-4">
                <h3 className="font-semibold mb-2">Đế bánh</h3>
                <div className="space-y-3 ">
                  {crusts.map((variant) => (
                    <label
                      key={variant.id}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="crust"
                          checked={selectedCrust.id === variant.id}
                          onChange={() => setSelectedCrust(variant)}
                          className="w-4 h-4"
                        />
                        <span>
                          {variant.crust.name} ({selectedSize.name})
                        </span>
                      </div>
                      <span className="font-semibold">
                        {Number(variant.price).toLocaleString()} đ
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Số lượng + nút thêm */}
            <div className="mt-6  flex items-center gap-4 pr-6">
              <div className="flex items-center ">
                <button
                  className="px-3 py-1 text-lg border rounded-lg text-red-700 border-gray-300"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <MinusOutlined />
                </button>
                <span className="px-4">{quantity}</span>
                <button
                  className="px-3 py-1 text-lg border rounded-lg  text-red-700  border-gray-300"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <PlusOutlined />
                </button>
              </div>

              <button
                className="flex-1 bg-red-700 text-white py-3   rounded-lg flex items-center justify-center gap-2 font-semibold"
                onClick={addItem}
              >
                Thêm vào giỏ hàng •{" "}
                {(Number(selectedCrust.price) * quantity).toLocaleString()} đ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
