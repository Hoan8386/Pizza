import { FaFacebookF, FaYoutube, FaEnvelope } from "react-icons/fa";
import logo from "../../assets/logo.svg";
import apple_store from "../../assets/apple_store.svg";
import certification from "../../assets/certification.svg";
import ch_play from "../../assets/ch_play.svg";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8 rounded-4xl p-6 my-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1: Logo + Social */}
        <div>
          <img src={logo} alt="Logo" className="w-32 mb-4" />{" "}
          {/* Thêm src sau */}
          <div className="flex gap-4 text-2xl text-red-600">
            <a href="#" className="" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="YouTube">
              <FaYoutube />
            </a>
            <a href="#" aria-label="Gmail">
              <FaEnvelope />
            </a>
          </div>
        </div>

        {/* Cột 2: Về chúng tôi */}
        <div>
          <h3 className="font-medium mb-4 text-xl">Về chúng tôi</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <a
                href="#"
                className=""
                style={{
                  fontSize: "17px",
                }}
              >
                Giới thiệu
              </a>
            </li>
            <li>
              <a
                href="#"
                className=""
                style={{
                  fontSize: "17px",
                }}
              >
                Tầm nhìn và sứ mệnh của chúng tôi
              </a>
            </li>
            <li>
              <a
                href="#"
                className=""
                style={{
                  fontSize: "17px",
                }}
              >
                Giá trị cốt lõi
              </a>
            </li>
            <li>
              <a
                href="#"
                className=""
                style={{
                  fontSize: "17px",
                }}
              >
                An toàn thực phẩm
              </a>
            </li>
            <li>
              <a
                href="#"
                className=""
                style={{
                  fontSize: "17px",
                }}
              >
                LIMO
              </a>
            </li>
            <li>
              <a
                href="#"
                className=""
                style={{
                  fontSize: "17px",
                }}
              >
                Cơ hội nghề nghiệp
              </a>
            </li>
          </ul>
        </div>

        {/* Cột 3: Vị trí cửa hàng */}
        <div>
          <h3 className="font-medium mb-4 text-xl">Vị trí cửa hàng</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <a
                href="#"
                className=""
                style={{
                  fontSize: "17px",
                }}
              >
                Miền Bắc
              </a>
            </li>
            <li>
              <a
                href="#"
                className=""
                style={{
                  fontSize: "17px",
                }}
              >
                Miền Trung
              </a>
            </li>
            <li>
              <a
                href="#"
                className=""
                style={{
                  fontSize: "17px",
                }}
              >
                Miền Nam
              </a>
            </li>
          </ul>
        </div>

        {/* Cột 4: Tải ứng dụng */}
        <div>
          <h3 className="font-medium mb-4 text-xl">Tải ứng dụng</h3>
          <div className="flex flex-col gap-3">
            <a
              href="#"
              className=""
              style={{
                fontSize: "17px",
              }}
            >
              <img src={ch_play} alt="Google Play" className="w-40" />
            </a>{" "}
            {/* Thêm src sau */}
            <a
              href="#"
              className=""
              style={{
                fontSize: "17px",
              }}
            >
              <img src={apple_store} alt="App Store" className="w-40" />
            </a>{" "}
            {/* Thêm src sau */}
            <a
              href="#"
              className=""
              style={{
                fontSize: "17px",
              }}
            >
              <img
                src={certification}
                alt="Đã thông báo Bộ Công Thương"
                className="w-40"
              />
            </a>{" "}
            {/* Thêm src sau */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
