import { Link, useLocation, useNavigate } from "react-router-dom";

export const DetailCombo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const combo = location.state?.combo;

  if (!combo) {
    navigate(-1);
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div>
        <Link to="/">back</Link>
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
            <button
              onClick={() => alert("Thêm vào giỏ hàng")}
              className="w-full px-8 py-4 text-lg font-bold bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xl transition"
            >
              🛒 Đặt hàng ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
