import { useContext, useEffect, useState } from "react";
import { Modal, Rate, Spin, Input, Button } from "antd";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import {
  getReviewProductApi,
  reviewProductApi,
} from "../../../services/api.service";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/auth.context";
import {
  UserOutlined,
  StarFilled,
  ClockCircleOutlined,
  LoginOutlined, // Thêm icon đăng nhập
} from "@ant-design/icons";

export const ModelReviewProduct = ({ product, onClose }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // 2. Khởi tạo navigate

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReview = async () => {
    if (!product) return;
    try {
      setLoading(true);
      const res = await getReviewProductApi(product.id);
      if (res.data) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product) {
      fetchReview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const handleSubmit = async () => {
    // Không cần check user.id ở đây nữa vì UI đã chặn rồi,
    // nhưng giữ lại để bảo mật thêm cũng tốt.
    if (user?.id) {
      if (!rating || !comment.trim()) {
        toast.warning("Vui lòng nhập đầy đủ đánh giá!");
        return;
      }
      setSubmitting(true);
      try {
        const res = await reviewProductApi(product.id, rating, comment);

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Đánh giá thành công");
          setRating(0);
          setComment("");
          fetchReview();
        }
      } catch (err) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại!", err);
      } finally {
        setSubmitting(false);
      }
    } else {
      toast.error("Bạn phải đăng nhập để đánh giá");
    }
  };

  // Hàm xử lý chuyển trang đăng nhập
  const handleLoginRedirect = () => {
    onClose(); // Đóng modal hiện tại
    navigate("/login"); // Chuyển hướng sang trang login (thay đổi đường dẫn nếu cần)
  };

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  if (!product) return null;

  return (
    <Modal
      open={!!product}
      onCancel={onClose}
      footer={null}
      width={800}
      className="review-modal"
      closeIcon={
        <span className="text-gray-400 hover:text-gray-600 text-xl">✕</span>
      }
    >
      <div className="max-h-[80vh] overflow-y-auto overflow-x-hidden">
        {/* Header - Product Info */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 -mt-6 -mx-6 px-4 py-5 mb-6">
          <div className="flex gap-4">
            <div className="w-28 h-28 flex-shrink-0 bg-white rounded-2xl shadow-md overflow-hidden ml-5 mt-5">
              <img
                src={`http://localhost:8000/images${product.image_url}`}
                alt={product.name}
                className="w-full h-full object-cover "
              />
            </div>
            <div className="flex-1 min-w-0 mt-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2 truncate">
                {product.name}
              </h2>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {product.description}
              </p>

              {/* Rating Summary */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full ">
                  <StarFilled style={{ color: "#fadb14", fontSize: "18px" }} />
                  <span className="text-xl font-bold text-yellow-600">
                    {avgRating}
                  </span>
                  <span className="text-sm text-yellow-600">
                    ({reviews.length} đánh giá)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Logic hiển thị Form đánh giá hoặc Nút đăng nhập */}
        {user?.id ? (
          /* TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP: Hiển thị form đánh giá */
          <div className="bg-gray-50 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <UserOutlined className="text-red-600 text-lg" />
              </div>
              <h3 className="text-lg font-bold text-yellow-600">
                Viết đánh giá của bạn
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-yellow-600 mb-2">
                  Đánh giá của bạn
                </label>
                <Rate
                  value={rating}
                  onChange={setRating}
                  className="text-xl"
                  style={{ color: "#fadb14" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-600 mb-2">
                  Nhận xét chi tiết
                </label>
                <Input.TextArea
                  rows={3}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="rounded-xl"
                  style={{
                    resize: "none",
                  }}
                />
              </div>

              <Button
                type="primary"
                size="large"
                loading={submitting}
                onClick={handleSubmit}
                className="w-full h-11 rounded-xl font-semibold"
                style={{
                  backgroundColor: "#b91c1c",
                  borderColor: "#b91c1c",
                }}
              >
                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </div>
          </div>
        ) : (
          /* TRƯỜNG HỢP CHƯA ĐĂNG NHẬP: Hiển thị nút yêu cầu đăng nhập */
          <div className="bg-gray-50 rounded-2xl p-8 mb-5 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
              <LoginOutlined className="text-2xl text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              Bạn cần đăng nhập để đánh giá
            </h3>
            <p className="text-gray-500 mb-4 text-sm max-w-xs">
              Vui lòng đăng nhập tài khoản để chia sẻ trải nghiệm của bạn về sản
              phẩm này.
            </p>
            <Button
              type="primary"
              size="large"
              onClick={handleLoginRedirect}
              className="h-10 px-8 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
              style={{
                backgroundColor: "#b91c1c",
                borderColor: "#b91c1c",
              }}
            >
              Đăng nhập ngay
            </Button>
          </div>
        )}

        {/* Reviews List */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-bold text-yellow-600">
              Đánh giá từ khách hàng
            </h3>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
              {reviews.length} đánh giá
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spin size="large" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-base">
                        {review.user?.full_name?.charAt(0).toUpperCase() || "K"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-yellow-600 truncate">
                            {review.user?.full_name || "Khách hàng"}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <ClockCircleOutlined />
                            <span>Vừa mới</span>
                          </div>
                        </div>
                        <Rate
                          disabled
                          value={review.rating}
                          className="text-sm"
                        />
                      </div>

                      <p className="text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <div className="text-6xl mb-4">📝</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Chưa có đánh giá nào
              </h4>
              <p className="text-gray-500">
                Hãy là người đầu tiên đánh giá sản phẩm này!
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
