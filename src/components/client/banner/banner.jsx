import { ArrowDownOutlined } from "@ant-design/icons";
import { Carousel } from "antd";
import banner1 from "../../../assets/banner/1.webp";
import banner2 from "../../../assets/banner/2.webp";
import banner3 from "../../../assets/banner/3.webp";
import banner4 from "../../../assets/banner/4.webp";
import banner5 from "../../../assets/banner/5.webp";
import banner6 from "../../../assets/banner/6.webp";
import banner7 from "../../../assets/banner/7.webp";

export const Banner = () => {
  const images = [
    banner1,
    banner2,
    banner3,
    banner4,
    banner5,
    banner6,
    banner7,
  ];

  return (
    <>
      <div style={{ borderRadius: "30px", overflow: "hidden" }}>
        <Carousel autoplay arrows="true">
          {images.map((img, index) => (
            <div key={index}>
              <img
                src={img}
                alt={`Banner ${index + 1}`}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </>
  );
};
