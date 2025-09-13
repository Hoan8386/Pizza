import { useEffect, useState } from "react";
import { getAllOrder } from "../services/api.service";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

export const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getAllOrder();
        setOrders(res.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // Tính toán orders hiển thị theo trang
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Số lượng trang
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <>
      <div className="flex-1 mb-4">
        <Link to="/">
          <ArrowLeftOutlined /> Trở lại
        </Link>
      </div>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-red-700 mb-6">
          Danh sách đơn hàng
        </h1>

        <div className="flex flex-col gap-6">
          {currentOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-lg p-5 flex flex-col hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Thông tin người dùng */}
              <div className="mb-3">
                <h2 className="text-xl font-semibold text-red-700">
                  {order.id}
                </h2>
                <p className="text-gray-600 text-sm">{order.user.email}</p>
                <p className="text-gray-600 text-sm">
                  {order.shipping_address}
                </p>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="mb-3 space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 border-b pb-2"
                  >
                    <img
                      src={
                        item.combo
                          ? `http://localhost:8000/images${item.combo.image_url}`
                          : `http://localhost:8000/images${item.product_variant.product.image_url}`
                      }
                      alt={
                        item.combo
                          ? item.combo.name
                          : item.product_variant.product.name
                      }
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.combo
                          ? item.combo.name
                          : item.product_variant.product.name}{" "}
                        x{item.quantity}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {item.combo
                          ? item.combo.description
                          : item.product_variant.product.description}
                      </p>
                    </div>
                    <p className="font-semibold text-red-700">{item.price}₫</p>
                  </div>
                ))}
              </div>

              {/* Tổng tiền & trạng thái */}
              <div className="mt-auto flex justify-between items-center">
                <p className="font-bold text-red-700 text-lg">
                  {order.total_amount}₫
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-white ${
                    order.status === "pending" ? "bg-red-700" : "bg-green-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Nút phân trang */}
        <div className="flex justify-center mt-6 gap-4">
          <button
            className="px-4 py-2 bg-red-700 text-white rounded disabled:bg-gray-400"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </button>
          <span className="flex items-center gap-2">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-red-700 text-white rounded disabled:bg-gray-400"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};
