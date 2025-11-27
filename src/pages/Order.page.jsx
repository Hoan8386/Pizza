import { useEffect, useState } from "react";
import { getAllOrder } from "../services/api.service";
import { Link } from "react-router-dom";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  DollarOutlined,
  CreditCardOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Empty, Spin, Tag, Pagination } from "antd";
import dayjs from "dayjs";

const StatusConfig = {
  pending: {
    label: "Chờ xác nhận",
    icon: <ClockCircleOutlined />,
    color: "warning",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
  },
  confirmed: {
    label: "Đã xác nhận",
    icon: <CheckCircleOutlined />,
    color: "processing",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  shipped: {
    label: "Đang giao",
    icon: <TruckOutlined />,
    color: "processing",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
  },
  delivered: {
    label: "Đã giao",
    icon: <CheckCircleOutlined />,
    color: "success",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
  cancelled: {
    label: "Đã huỷ",
    icon: <ArrowLeftOutlined />,
    color: "error",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
  },
};

const PaymentMethodConfig = {
  cash: {
    label: "Tiền mặt",
    icon: <WalletOutlined />,
    color: "green",
  },
  credit_card: {
    label: "Thẻ tín dụng",
    icon: <CreditCardOutlined />,
    color: "blue",
  },
  bank_transfer: {
    label: "Chuyển khoản",
    icon: <CreditCardOutlined />,
    color: "cyan",
  },
  paypal: {
    label: "PayPal",
    icon: <CreditCardOutlined />,
    color: "purple",
  },
  vnpay: {
    label: "VNPay",
    icon: <CreditCardOutlined />,
    color: "red",
  },
};

export const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await getAllOrder();
        setOrders(res.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-red-600 hover:bg-gray-50 shadow-sm transition-all hover:shadow-md border border-red-200"
              >
                <ArrowLeftOutlined />
                <span>Trở lại</span>
              </Link>
            </div>
          </div>

          {/* Title Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-12 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
              <div>
                <p className="text-orange-600 font-bold text-sm uppercase tracking-widest m-0">
                  Quản lý đơn hàng
                </p>
                <h1 className="text-4xl font-black text-gray-900 m-0 leading-tight">
                  Lịch Sử Đơn Hàng
                </h1>
              </div>
            </div>
            <p className="text-gray-600 text-lg ml-5">
              Theo dõi tình trạng và chi tiết của các đơn hàng của bạn
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : currentOrders.length === 0 ? (
            <Empty
              description="Không có đơn hàng nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-20"
            />
          ) : (
            <>
              <div className="space-y-6">
                {currentOrders.map((order) => {
                  const statusConfig =
                    StatusConfig[order.status] || StatusConfig.pending;
                  const createdDate = dayjs(order.created_at);

                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 ${statusConfig.borderColor} overflow-hidden`}
                    >
                      {/* Header - Order Info */}
                      <div
                        className={`${statusConfig.bgColor} px-6 py-5 border-b`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          {/* Order ID */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Mã đơn hàng
                            </p>
                            <p className="text-2xl font-black text-red-600">
                              #{order.id}
                            </p>
                          </div>

                          {/* Date */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Ngày đặt hàng
                            </p>
                            <p className="text-sm font-semibold text-gray-700">
                              {createdDate.format("DD/MM/YYYY")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {createdDate.format("HH:mm")}
                            </p>
                          </div>

                          {/* Status */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Trạng thái
                            </p>
                            <Tag
                              icon={statusConfig.icon}
                              color={statusConfig.color}
                              className="px-3 py-1 text-sm font-semibold"
                            >
                              {statusConfig.label}
                            </Tag>
                          </div>

                          {/* Payment Method */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Thanh toán
                            </p>
                            {order.payments && order.payments.length > 0 ? (
                              <Tag
                                icon={
                                  PaymentMethodConfig[order.payments[0].method]
                                    ?.icon
                                }
                                color={
                                  PaymentMethodConfig[order.payments[0].method]
                                    ?.color
                                }
                                className="px-3 py-1 text-sm font-semibold"
                              >
                                {PaymentMethodConfig[order.payments[0].method]
                                  ?.label || order.payments[0].method}
                              </Tag>
                            ) : (
                              <Tag
                                color="default"
                                className="px-3 py-1 text-sm"
                              >
                                Chưa có phương thức
                              </Tag>
                            )}
                          </div>

                          {/* Total */}
                          <div className="text-right md:text-left">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Tổng tiền
                            </p>
                            <p className="text-2xl font-black text-red-600">
                              {Number(order.total_amount).toLocaleString(
                                "vi-VN"
                              )}{" "}
                              ₫
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div className="px-6 py-5 bg-gray-50 border-b">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <EnvironmentOutlined className="text-orange-600 text-lg" />
                          Thông Tin Giao Hàng
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Recipient Info */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Người nhận
                              </p>
                              <p className="text-gray-800 font-semibold">
                                {order.user?.full_name || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                <PhoneOutlined className="text-sm" /> Điện thoại
                              </p>
                              <p className="text-gray-700 font-medium">
                                {order.user?.phone || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Address & Email */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Địa chỉ giao hàng
                              </p>
                              <p className="text-gray-700 font-medium leading-relaxed">
                                {order.shipping_address || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                <MailOutlined className="text-sm" /> Email
                              </p>
                              <p className="text-gray-700 font-medium">
                                {order.user?.email || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Products List */}
                      <div className="px-6 py-5">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">
                          Danh Sách Sản Phẩm ({order.items?.length || 0})
                        </h3>

                        <div className="space-y-3">
                          {order.items?.map((item, idx) => {
                            const product =
                              item.combo || item.product_variant?.product;
                            const imageUrl = product?.image_url
                              ? `http://localhost:8000/images${product.image_url}`
                              : null;

                            return (
                              <div
                                key={idx}
                                className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                              >
                                {/* Product Image */}
                                <div className="flex-shrink-0">
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={product?.name}
                                      className="w-20 h-20 rounded-lg object-cover shadow-sm"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.parentElement.innerHTML =
                                          '<div class="w-20 h-20 rounded-lg bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center text-2xl">🍕</div>';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center text-2xl">
                                      🍕
                                    </div>
                                  )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 truncate">
                                    {product?.name}
                                  </p>
                                  {item.product_variant?.size && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      Size:{" "}
                                      <span className="font-medium">
                                        {item.product_variant.size.name}
                                      </span>
                                    </p>
                                  )}
                                  {item.product_variant?.crust && (
                                    <p className="text-xs text-gray-600">
                                      Đế:{" "}
                                      <span className="font-medium">
                                        {item.product_variant.crust.name}
                                      </span>
                                    </p>
                                  )}
                                </div>

                                {/* Quantity & Price */}
                                <div className="text-right flex flex-col justify-center gap-1">
                                  <p className="text-sm font-semibold text-gray-900">
                                    x{item.quantity}
                                  </p>
                                  <p className="text-red-600 font-bold">
                                    {Number(item.price).toLocaleString("vi-VN")}{" "}
                                    ₫
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="px-6 py-5 bg-gradient-to-r from-red-50 to-orange-50 border-t">
                        <div className="flex flex-col md:flex-row md:justify-between gap-4">
                          {order.note && (
                            <div className="text-sm">
                              <p className="text-gray-600 mb-1">
                                <strong>Ghi chú:</strong> {order.note}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center justify-between md:justify-end gap-8">
                            {order.coupon &&
                              typeof order.coupon === "object" &&
                              order.coupon.code && (
                                <div className="text-right">
                                  <p className="text-xs text-gray-600 mb-1">
                                    Mã giảm:{" "}
                                    <span className="font-semibold text-red-600">
                                      {order.coupon.code}
                                    </span>
                                  </p>
                                  {order.coupon.discount_amount === null &&
                                  order.coupon.discount_percentage ? (
                                    <p className="text-sm font-semibold text-gray-700">
                                      Giảm: {order.coupon.discount_percentage}%
                                    </p>
                                  ) : order.coupon.discount_percentage ===
                                      null && order.coupon.discount_amount ? (
                                    <p className="text-sm font-semibold text-gray-700">
                                      Giảm: -
                                      {Number(
                                        order.coupon.discount_amount
                                      ).toLocaleString("vi-VN")}{" "}
                                      ₫
                                    </p>
                                  ) : null}
                                </div>
                              )}
                            <div className="text-right">
                              <p className="text-xs text-gray-600 mb-1 flex items-center justify-end gap-1">
                                <DollarOutlined /> Thành tiền
                              </p>
                              <p className="text-2xl font-black text-red-600">
                                {Number(order.total_amount).toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                ₫
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12 pb-8">
                  <Pagination
                    current={currentPage}
                    total={orders.length}
                    pageSize={ordersPerPage}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    showQuickJumper
                    className="text-center"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
