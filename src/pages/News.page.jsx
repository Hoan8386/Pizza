import { useEffect, useState } from "react";
import { getAllNews } from "../services/api.service";
import { Spin, Empty, Card } from "antd";
import {
  CalendarOutlined,
  ReadOutlined,
  FireOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await getAllNews();
      if (res.data) {
        setNews(res.data);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 mb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-12 bg-gradient-to-b from-red-500 via-red-500 to-orange-500 rounded-full"></div>
            <div>
              <p className="text-orange-500 font-bold text-sm uppercase tracking-widest m-0">
                Cập nhật mới
              </p>
              <h1 className="text-5xl font-black text-gray-900 m-0 leading-tight">
                Tin Tức & Khuyến Mãi
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-lg ml-5 max-w-2xl">
            Khám phá những chương trình ưu đãi hấp dẫn, sản phẩm mới và sự kiện
            đặc biệt từ Pizza Store
          </p>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Spin size="large" />
          </div>
        ) : news.length > 0 ? (
          <div>
            {/* Featured News */}
            {news[0] && (
              <div className="mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                  {/* Featured Image */}
                  <div className="lg:col-span-1 order-2 lg:order-1">
                    <div className="relative h-72 lg:h-full rounded-3xl overflow-hidden shadow-2xl group">
                      <img
                        alt={news[0].title}
                        src={`http://localhost:8000/images/${news[0].image_url}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-200 to-red-200">
                              <div class="text-9xl">🍕</div>
                            </div>
                          `;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    </div>
                  </div>

                  {/* Featured Content */}
                  <div className="lg:col-span-2 order-1 lg:order-2 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-4 uppercase tracking-wider">
                      <FireOutlined className="text-lg" />
                      Tin Nổi Bật
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight hover:text-red-500 transition-colors cursor-pointer">
                      {news[0].title}
                    </h2>

                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                      {news[0].content}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-500 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarOutlined />
                        <span>Hôm nay</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockCircleOutlined />
                        <span>5 phút đọc</span>
                      </div>
                    </div>

                    <button className="w-fit bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-4 px-8 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center gap-2 group">
                      Đọc Ngay
                      <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="my-16 h-1 bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>

            {/* News Grid */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-10">
                Các Tin Tức Khác
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.slice(1).map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-red-200 transform hover:-translate-y-2"
                  >
                    {/* Image */}
                    <div className="relative h-56 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
                      <img
                        alt={item.title}
                        src={`http://localhost:8000/images/${item.image_url}`}
                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center">
                              <div class="text-7xl">🍕</div>
                            </div>
                          `;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      {/* Category Badge */}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-red-500">
                        Tin Tức
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-1">
                          <CalendarOutlined />
                          <span>Hôm nay</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ReadOutlined />
                          <span>3 phút</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-500 transition-colors">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-6">
                        {item.content}
                      </p>

                      {/* Button */}
                      <button className="w-full bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 text-red-500 font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group">
                        Xem Chi Tiết
                        <ArrowRightOutlined className="text-sm group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-32">
            <Empty
              description="Chưa có tin tức nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
