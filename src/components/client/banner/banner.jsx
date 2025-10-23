import { ArrowDownOutlined } from "@ant-design/icons";
import { Carousel } from "antd";
import { useEffect, useState } from "react";
import { getAllBannerApi } from "../../../services/api.service";

export const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState({});

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await getAllBannerApi();
        console.log("check banner", res.data);
        setBanners(res.data);
      } catch (error) {
        console.error("Lỗi khi gọi API getAllBannerApi:", error);
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const handleImageLoad = (index) => {
    setImageLoaded((prev) => ({ ...prev, [index]: true }));
  };

  if (isLoading) {
    return (
      <div style={{ borderRadius: "30px", overflow: "hidden" }}>
        <div className="w-full h-[400px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-xl">Đang tải banner...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ borderRadius: "30px", overflow: "hidden" }}>
        <Carousel autoplay arrows="true">
          {banners.map((item, index) => (
            <div key={index} className="relative">
              {console.log(`http://localhost:8000/images${item.image_url}`)}
              {!imageLoaded[index] && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div>
                </div>
              )}
              <img
                src={`http://localhost:8000/images${item.image_url}`}
                alt={`Banner ${index + 1}`}
                onLoad={() => handleImageLoad(index)}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                  opacity: imageLoaded[index] ? 1 : 0,
                  transition: "opacity 0.3s ease-in-out",
                }}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </>
  );
};
