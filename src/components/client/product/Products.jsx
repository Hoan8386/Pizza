import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { ModelProduct } from "../model/ModelProduct";
import { ModelReviewProduct } from "../ratting/Review";

export const ProductListItem = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewProduct, setReviewProduct] = useState(null);
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {products.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedProduct(item)}
            className="flex-1 h-[230px] border product__item group relative cursor-pointer"
            style={{
              border: "1px solid rgb(223, 228, 234)",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <div className="flex bg-white h-full">
              {/* Ảnh bên trái */}
              <div
                className="overflow-hidden relative"
                style={{ height: "100%", width: "35%" }}
              >
                <div
                  className="absolute w-[312px] h-[380px]"
                  style={{ left: "-120px", top: "-4%" }}
                >
                  <img
                    src={`http://localhost:8000/images${item.image_url}`}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* Thông tin bên phải */}
              <div className="w-2/3 p-4 flex flex-col justify-between">
                <div>
                  <h6 className="text-[24px] leading-[30px] font-semibold text-gray-700 line-clamp-2">
                    {item.name}
                  </h6>
                  <p className="text-[18px] leading-[26px] font-normal text-left text-gray-500 truncate">
                    {item.description}
                  </p>
                  <span className="text-white bg-red-700 px-1.5 mt-2 inline-block h-6 leading-6 rounded-md">
                    NEW
                  </span>
                  <div
                    className="mt-3 text-red-700 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation(); // chặn click lan ra ngoài
                      setReviewProduct(item);
                    }}
                  >
                    Xem đánh giá
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Chỉ từ </p>
                  <p className="text-[24px] leading-[30px] font-semibold text-red-600">
                    {item.product_variants[0].price.toLocaleString()}₫
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute right-4 bottom-4 w-[48px] h-[48px] bg-red-700 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                <PlusOutlined />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal hiển thị khi chọn sản phẩm */}
      {selectedProduct && (
        <ModelProduct
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {reviewProduct && (
        <ModelReviewProduct
          product={reviewProduct}
          onClose={() => setReviewProduct(null)}
        />
      )}
    </>
  );
};
