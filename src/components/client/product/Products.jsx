import { PlusOutlined } from "@ant-design/icons";
import pizza from "../../../assets/pizza/pizza.webp";

export const ProductListItem = (props) => {
  // Dữ liệu mẫu
  const { products } = props;
  // const products = [
  //   {
  //     id: 1,
  //     image: "https://via.placeholder.com/150",
  //     name: "Pizza Hải Sản",
  //     ingredients: "Tôm, mực, phô mai, sốt cà chua",
  //     price: 199000,
  //   },
  //   {
  //     id: 2,
  //     image: "https://via.placeholder.com/150",
  //     name: "Pizza Bò",
  //     ingredients: "Thịt bò, hành tây, phô mai",
  //     price: 189000,
  //   },
  //   {
  //     id: 3,
  //     image: "https://via.placeholder.com/150",
  //     name: "Pizza Gà nướng, hành tây, phô mai, sốt BBQ ",
  //     ingredients: "Gà nướng, hành tây, phô mai, sốt BBQ",
  //     price: 179000,
  //   },
  //   {
  //     id: 4,
  //     image: "https://via.placeholder.com/150",
  //     name: "Pizza Chay",
  //     ingredients: "Nấm, ớt chuông, phô mai, sốt cà chua",
  //     price: 159000,
  //   },
  // ];
  console.log("check product ", products);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {products.map((item) => (
        <div
          key={item.id}
          className="flex-1 h-[230px] border  product__item group relative"
          style={{
            border: "1px solid rgb(223, 228, 234)",
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <div className="flex bg-white h-full">
            {/* Ảnh bên trái */}
            <div
              className=" overflow-hidden relative "
              style={{
                height: "100%",
                width: "35%",
              }}
            >
              <div
                className="absolute w-[312px] h-[380px] "
                style={{
                  left: "-120px",
                  top: "-4% ",
                }}
              >
                <img
                  src={pizza}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>

            {/* Thông tin bên phải */}
            <div className="w-2/3 p-4 flex flex-col justify-between">
              <div>
                <h6 className="text-[24px] leading-[30px] font-semibold text-gray-700 line-clamp-2">
                  {item.product.name}
                </h6>
                <p className="text-[18px] leading-[26px] font-normal text-left text-gray-500 truncate">
                  {item.product.description}
                </p>
                <span className="text-white bg-red-700 px-1.5 mt-2 inline-block h-6 leading-6 rounded-md">
                  NEW
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Chỉ từ </p>
                <p className="text-[24px] leading-[30px] font-semibold text-red-600">
                  {item.price.toLocaleString()}₫
                </p>
              </div>
            </div>
          </div>

          <div className="absolute right-4 bottom-4 w-[48px] h-[48px]  bg-red-700 rounded-full flex items-center justify-center cursor-pointer">
            <span className="text-white text-2xl font-bold">
              <PlusOutlined />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
