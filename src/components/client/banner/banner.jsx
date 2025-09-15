import { ArrowDownOutlined } from "@ant-design/icons";
import { Carousel } from "antd";
import { useEffect, useState } from "react";
import { getAllBannerApi } from "../../../services/api.service";

export const Banner = () => {
  const [banners, setBanners] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllBannerApi();
        console.log("check banner", res.data);
        setBanners(res.data);
      } catch (error) {
        console.error("Lỗi khi gọi API getAllBannerApi:", error);
        setBanners([]);
      }
    };
    fetch();
  }, []);

  return (
    <>
      <div style={{ borderRadius: "30px", overflow: "hidden" }}>
        <Carousel autoplay arrows="true">
          {banners.map((item, index) => (
            <div key={index}>
              {console.log(`http://localhost:8000/images${item.image_url}`)}
              <img
                src={`http://localhost:8000/images${item.image_url}`}
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
