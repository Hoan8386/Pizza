import { useState } from "react";
import { Link } from "react-router-dom";
import { ModelReviewProduct } from "../ratting/Review";

export const CombosListItem = ({ combos }) => {
  // const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [imageLoaded, setImageLoaded] = useState({});

  const handleImageLoad = (comboId) => {
    setImageLoaded((prev) => ({ ...prev, [comboId]: true }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
      {combos.map((combo) => (
        <Link
          key={combo.id}
          to={`/combos/${combo.id}`}
          state={{ combo }} // ✅ Truyền toàn bộ combo qua state
          className="bg-white rounded-2xl overflow-hidden shadow-md group cursor-pointer hover:shadow-xl transition-shadow duration-300"
        >
          {/* Ảnh combo */}
          <div className="relative w-full h-70 bg-red-600 flex items-center justify-center overflow-hidden">
            {!imageLoaded[combo.id] && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-600 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
              </div>
            )}
            <img
              src={`http://localhost:8000/images${combo.image_url}`}
              alt={combo.name}
              onLoad={() => handleImageLoad(combo.id)}
              className="object-contain max-h-full max-w-full group-hover:scale-110 transform transition-transform duration-500"
              style={{
                opacity: imageLoaded[combo.id] ? 1 : 0,
                transition: "opacity 0.4s ease-in-out",
              }}
            />
          </div>

          {/* Nội dung combo */}
          <div className="p-4">
            <h3 className="text-lg font-bold uppercase text-gray-800">
              {combo.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Chỉ từ{" "}
              <span className="text-lg font-bold text-gray-900">
                {parseFloat(combo.price).toLocaleString()} ₫
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {combo.description}
            </p>

            <div
              className="mt-3 text-red-700 hover:text-red-600"
              onClick={(e) => {
                e.preventDefault(); // ❌ Ngăn Link redirect
                e.stopPropagation(); // ❌ Ngăn lan sự kiện
                setReviewProduct(combo);
              }}
            >
              Xem đánh giá
            </div>
          </div>
        </Link>
      ))}
      {reviewProduct && (
        <ModelReviewProduct
          product={reviewProduct}
          onClose={() => setReviewProduct(null)}
        />
      )}
    </div>
  );
};
