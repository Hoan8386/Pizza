import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { addComboCartApi, getCart } from "../../../services/api.service";
import { toast } from "react-toastify";
import { Button } from "antd";
import { AuthContext } from "../../context/auth.context";
import { ArrowLeftOutlined } from "@ant-design/icons";

export const DetailCombo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const combo = location.state?.combo;
  const [isLoading, setIsLoading] = useState(false);
  const { setCart } = useContext(AuthContext);

  if (!combo) {
    navigate(-1);
    return null;
  }
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
    console.log("combo", combo);
    setIsLoading(true);
    const res = await addComboCartApi(combo.id, 1);
    console.log("thêm sản phẩm thành công ", res);
    fetchCart();
    toast.success("Thêm sản phẩm vào giỏ hàng thành công");
    setIsLoading(false);
  };
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-4">
        <Link to="/">
          <ArrowLeftOutlined /> Trở lại{" "}
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {/* Cột trái - Ảnh combo */}
        <div className="flex flex-col h-full gap-4">
          {/* Ảnh combo lớn chiếm khoảng 2/3 chiều cao */}
          <div className="flex-2 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={`http://localhost:8000/images${combo.image_url}`}
              alt={combo.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Ảnh sản phẩm nhỏ chiếm khoảng 1/3 chiều cao */}
          <div className="flex-1 grid grid-cols-3 gap-4">
            {combo.items.map((item) => (
              <div
                key={item.id}
                className="w-full h-full rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
              >
                <img
                  src={`http://localhost:8000/images${item.product_variant.product.image_url}`}
                  alt={item.product_variant.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải - Thông tin combo */}
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto pr-2">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              {combo.name}
            </h1>
            <p className="text-gray-700 text-lg mb-6">{combo.description}</p>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-red-600">
                {parseFloat(combo.price).toLocaleString()} ₫
              </span>
              <span className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-full font-medium">
                Giảm giá đặc biệt
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Áp dụng từ <span className="font-medium">{combo.start_date}</span>{" "}
              đến <span className="font-medium">{combo.end_date}</span>
            </p>

            <h2 className="text-xl font-bold mb-3">Chi tiết món trong combo</h2>
            <div className="space-y-4">
              {combo.items.map((item) => {
                const pv = item.product_variant;
                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {pv.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {pv.size
                          ? `Size: ${pv.size.name} (${pv.size.diameter}cm)`
                          : ""}
                        {pv.crust ? ` | Đế: ${pv.crust.name}` : ""}
                      </p>
                      <p className="text-sm text-gray-500">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-red-600 text-lg">
                      {parseFloat(pv.price).toLocaleString()} ₫
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nút đặt hàng luôn ở dưới */}
          <div className="mt-4 flex-shrink-0">
            <Button
              onClick={addItem}
              style={{
                backgroundColor: "rgb(200 16 46)",
                color: "white",
                border: "none",
                fontSize: "16px",
                height: "50px",
                width: "100%",
                borderRadius: "10px",
              }}
              loading={isLoading}
            >
              🛒 Đặt hàng ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
