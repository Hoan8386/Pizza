import { useEffect, useState } from "react";
import { Modal, Rate, Spin, Input, Button } from "antd";
import {
  getReviewProductApi,
  reviewProductApi,
} from "../../../services/api.service";
import { toast } from "react-toastify";

export const ModelReviewProduct = ({ product, onClose }) => {
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
  }, [product]);

  const handleSubmit = async () => {
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
  };

  if (!product) return null;

  return (
    <Modal
      title={`Đánh giá sản phẩm: ${product.name}`}
      open={!!product}
      onCancel={onClose}
      footer={null}
      width={700}
      height={"100%"}
      style={{
        overflowY: "hidden",
        padding: "0",
      }}
    >
      <div className="">
        {/* Thông tin sản phẩm */}
        <div className="flex gap-4">
          <img
            src={`http://localhost:8000/images${product.image_url}`}
            alt={product.name}
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {product.name}
            </h2>
            <p className="text-sm text-gray-500 line-clamp-2">
              {product.description}
            </p>
          </div>
        </div>

        {/* Danh sách review */}
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-2">
            Đánh giá từ khách hàng
          </h3>

          {loading ? (
            <div className="flex justify-center py-4">
              <Spin />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="  p-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {review.user?.full_name || "Khách"}
                    </p>
                    <Rate disabled defaultValue={review.rating} />
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Chưa có đánh giá nào.</p>
          )}
        </div>

        {/* Form gửi review */}
        <div className="border-t pt-4">
          <h3 className="text-base font-semibold mb-2">
            Viết đánh giá của bạn
          </h3>
          <Rate value={rating} onChange={setRating} />
          <Input.TextArea
            rows={3}
            placeholder="Nhập nhận xét của bạn..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-2"
          />
          <Button
            type="primary"
            className="mt-3"
            loading={submitting}
            onClick={handleSubmit}
          >
            Gửi đánh giá
          </Button>
        </div>
      </div>
    </Modal>
  );
};
