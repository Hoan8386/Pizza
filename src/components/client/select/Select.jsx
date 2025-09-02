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

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -150, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 150, behavior: "smooth" });
  };
  console.log(categories);
  // Lấy banner của category đang active
  const activeBanner = categories[activeIndex]?.url; // giả sử categories[i].banner = URL ảnh
  console.log(activeBanner);
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
          {categories.map((item, index) => (
            <li
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative cursor-pointer transition-colors duration-300 flex-none text-center min-w-[100px] ${
                activeIndex === index
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
                  activeIndex === index ? "w-full left-0" : "w-0 left-1/2"
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
        <img
          src={`http://localhost:8000/images${activeBanner}`}
          className="w-full h-full object-cover transition-all duration-500"
        />
      </div>
    </>
  );
};

export default Select;
