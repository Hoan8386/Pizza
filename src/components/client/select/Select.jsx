import React, { useState } from "react";
import {
  GiftOutlined,
  FireOutlined,
  PieChartOutlined,
  AppstoreOutlined,
  CoffeeOutlined,
  ThunderboltOutlined,
  CaretUpOutlined,
} from "@ant-design/icons";

import NewProducts from "./NewProducts";
import ComboProducts from "./ComboProducts";
import PizzaProducts from "./PizzaProducts";
import ChickenProducts from "./ChickenProducts";
import AppetizerProducts from "./AppetizerProducts";
import DrinkProducts from "./DrinkProducts";
import SpicyProducts from "./SpicyProducts";
import bannerNew from "../../../assets/banner/new/new.webp";
import bannerKhaiVi from "../../../assets/banner/khaiVi/khaiVi.webp";
import bannerCombo from "../../../assets/banner/combo/combo.webp";
import bannerGhienGa from "../../../assets/banner/ghienGa/ghienGa.webp";
import bannerPizza from "../../../assets/banner/piazza/pizza.webp";
import bannerDoUong from "../../../assets/banner/thucUong/thucUong.webp";
import bannerCay from "../../../assets/banner/new/new.webp";
const Select = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const items = [
    {
      label: "MỚI",
      icon: <FireOutlined />,
      component: <NewProducts title="MỚI" banner={bannerNew} />,
    },
    {
      label: "COMBO",
      icon: <GiftOutlined />,
      component: <ComboProducts title="COMBO" banner={bannerCombo} />,
    },
    {
      label: "PIZZA",
      icon: <PieChartOutlined />,
      component: <PizzaProducts title="PIZZA" banner={bannerPizza} />,
    },
    {
      label: "GHIỀN GÀ",
      icon: <CaretUpOutlined />,
      component: <ChickenProducts title="GHIỀN GÀ" banner={bannerGhienGa} />,
    },
    {
      label: "MÓN KHAI VỊ",
      icon: <AppstoreOutlined />,
      component: (
        <AppetizerProducts title="MÓN KHAI VỊ" banner={bannerKhaiVi} />
      ),
    },
    {
      label: "ĐỒ UỐNG",
      icon: <CoffeeOutlined />,
      component: <DrinkProducts title="ĐỒ UỐNG" banner={bannerDoUong} />,
    },
    {
      label: "CAY",
      icon: <ThunderboltOutlined />,
      component: <SpicyProducts title="CAY" banner={bannerCay} />,
    },
  ];

  return (
    <div>
      {/* Thanh chọn */}
      <ul className="flex w-full ">
        {items.map((item, index) => (
          <li
            key={index}
            style={{
              fontSize: "16px",
              lineHeight: "24px",
            }}
            onClick={() => setActiveIndex(index)}
            className={`
              relative cursor-pointer transition-colors duration-300
              flex-1 text-center
              ${
                activeIndex === index
                  ? "text-red-700 font-bold"
                  : "text-gray-800"
              }
              hover:text-red-500 p-6
            `}
          >
            <div className="flex flex-col items-center gap-1">
              {item.icon}
              <span>{item.label}</span>
            </div>

            {/* Thanh underline */}
            <span
              className={`
                absolute bottom-[18px] h-[3px] bg-red-700 transition-all duration-300
                ${activeIndex === index ? "w-full left-0" : "w-0 left-1/2"}
              `}
            ></span>
          </li>
        ))}
      </ul>

      {/* Nội dung tương ứng */}
      <div className="mt-4">{items[activeIndex].component}</div>
    </div>
  );
};

export default Select;
