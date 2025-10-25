import { useRef } from "react";
import {
  LeftOutlined,
  RightOutlined,
  CoffeeOutlined,
  GiftOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

// Map icon theo category ID (bạn có thể chỉnh sửa)
const categoryIcons = {
  1: <PieChartOutlined />,
  2: <PieChartOutlined />,
  3: <PieChartOutlined />,
  4: <PieChartOutlined />,
  5: <PieChartOutlined />,
  6: <PieChartOutlined />,
  7: <CoffeeOutlined />,
  8: <GiftOutlined />,
  9: <GiftOutlined />,
  10: <GiftOutlined />,
};
const Select = (props) => {
  const { categories, activeIndex, setActiveIndex } = props;
  const scrollRef = useRef(null);
  console.log("check category check props", categories);
  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -150, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 150, behavior: "smooth" });
  };

  // Tìm category đang active theo id (activeIndex chứa id)
  const activeCategory = Array.isArray(categories)
    ? categories.find((c) => c.id === activeIndex) || categories[0]
    : null;
  const activeBanner = activeCategory?.url;

  // Xây dựng đường dẫn ảnh an toàn: API trả về "/categories/xxx.webp",
  // server thực tế lưu ảnh dưới /images + url. Nếu API trả về full URL thì dùng luôn.
  const buildImageSrc = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // nếu url đã có /images prefix
    if (url.startsWith("/images")) return `http://localhost:8000${url}`;
    // nếu url bắt đầu với /categories hoặc /... thì tiền tố /images
    return `http://localhost:8000/images${
      url.startsWith("/") ? "" : "/"
    }${url}`;
  };
  return (
    <>
      <div className="relative flex items-center">
        <button
          onClick={scrollLeft}
          className="absolute left-0 z-10 bg-white shadow-md p-2 rounded-full hover:bg-gray-100"
        >
          <LeftOutlined />
        </button>

        <ul
          ref={scrollRef}
          className="flex w-full overflow-x-auto no-scrollbar scrollbar-hide scroll-smooth px-10"
        >
          {categories.map((item) => (
            <li
              key={item.id}
              onClick={() => setActiveIndex(item.id)}
              className={`relative cursor-pointer transition-colors duration-300 flex-none text-center min-w-[100px] ${
                activeIndex === item.id
                  ? "text-red-700 font-bold"
                  : "text-gray-800"
              } hover:text-red-500 p-6`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="text-2xl">
                  {categoryIcons[item.id] || <GiftOutlined />}
                </div>
                <span>{item.name}</span>
              </div>
              <span
                className={`absolute bottom-[18px] h-[3px] bg-red-700 transition-all duration-300 ${
                  activeIndex === item.id ? "w-full left-0" : "w-0 left-1/2"
                }`}
              ></span>
            </li>
          ))}
        </ul>

        <button
          onClick={scrollRight}
          className="absolute right-0 z-10 bg-white shadow-md p-2 rounded-full hover:bg-gray-100"
        >
          <RightOutlined />
        </button>
      </div>

      {/* Banner hiển thị theo category */}
      <div className="banner mt-4 w-full h-[146px] overflow-hidden rounded-lg">
        {activeBanner ? (
          <img
            src={buildImageSrc(activeBanner)}
            alt={activeCategory?.name || "banner"}
            className="w-full h-full object-cover transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
    </>
  );
};

export default Select;
