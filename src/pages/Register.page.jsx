import { useState, useEffect } from "react";
import axios from "axios";
import logo from "../assets/logo.svg";
import logo2 from "../assets/PizzaHut.jpg";
import { createUserApi } from "../services/api.service";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "antd";

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    email: "",
    full_name: "",
    address: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios.get("https://provinces.open-api.vn/api/?depth=1").then((res) => {
      setProvinces(res.data);
    });
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((res) => {
          setDistricts(res.data.districts);
          setWards([]);
          setSelectedDistrict("");
          setSelectedWard("");
        });
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      axios
        .get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((res) => {
          setWards(res.data.wards);
          setSelectedWard("");
        });
    }
  }, [selectedDistrict]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { password, confirmPassword, email, full_name, phone } = formData;

    if (!password || !confirmPassword || !email || !full_name || !phone) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return false;
    }

    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      toast.error("Vui lòng chọn đầy đủ địa chỉ!");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Email không hợp lệ!");
      return false;
    }

    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return false;
    }

    if (!/^\d{9,12}$/.test(phone)) {
      toast.error("Số điện thoại không hợp lệ!");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    const fullAddress = `${
      wards.find((w) => w.code === Number(selectedWard))?.name || ""
    }, ${
      districts.find((d) => d.code === Number(selectedDistrict))?.name || ""
    }, ${
      provinces.find((p) => p.code === Number(selectedProvince))?.name || ""
    }`;

    const dataToSend = {
      ...formData,
      address: fullAddress,
    };

    try {
      const res = await createUserApi(dataToSend);

      if (res.data) {
        toast.success("Tạo tài khoản thành công!");
        navigate("/login");
      } else {
        console.log("check", res.messages.email[0]);
        toast.error(res.messages.email[0]);
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi tạo tài khoản!", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Logo */}
      <div className="flex justify-center p-4">
        <img src={logo} alt="Logo" />
      </div>

      {/* Header đỏ */}
      <div className="flex justify-center mx-auto">
        <div
          className="w-[521px] pt-6 pb-10 rounded-2xl flex flex-col items-center"
          style={{ backgroundColor: "rgb(200 16 46)" }}
        >
          <img src={logo2} alt="Pizza Hut" className="w-[90px] h-[90px]" />
          <p className="text-center text-sm text-white mt-6">
            Tạo tài khoản để nhận
          </p>
          <p className="text-center text-lg text-white font-semibold">
            Ưu đãi hấp dẫn
          </p>
        </div>
      </div>

      {/* Input fields */}
      <div className="w-full max-w-[512px] mx-auto flex flex-col bg-white shadow-[0_10px_15px_0_rgba(5,13,29,0.18)] px-4 py-6 gap-4 rounded-2xl mt-[-32px] md:mt-6">
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="py-3 px-5 border rounded-md border-gray-300"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          name="full_name"
          placeholder="Họ và tên"
          className="py-3 px-5 border rounded-md border-gray-300"
          value={formData.full_name}
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Số điện thoại"
          className="py-3 px-5 border rounded-md border-gray-300"
          value={formData.phone}
          onChange={handleChange}
        />

        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="py-3 px-5 border rounded-md border-gray-300"
        >
          <option value="">Chọn tỉnh/thành</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="py-3 px-5 border rounded-md border-gray-300"
          disabled={!districts.length}
        >
          <option value="">Chọn quận/huyện</option>
          {districts.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          className="py-3 px-5 border rounded-md border-gray-300"
          disabled={!wards.length}
        >
          <option value="">Chọn xã/phường</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>

        <div className="relative">
          <input
            name="password"
            placeholder="Mật khẩu"
            className="py-3 pr-10 pl-5 border rounded-md w-full border-gray-300"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <div className="relative">
          <input
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            className="py-3 pr-10 pl-5 border rounded-md w-full border-gray-300"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <Button
          onClick={handleSubmit}
          style={{
            backgroundColor: "rgb(200 16 46)",
            color: "white",
            border: "none",
            padding: "12px 40px",
            fontSize: "16px",
            fontWeight: "bold",
            height: "40px",
          }}
          loading={isLoading}
        >
          Tạo tài khoản
        </Button>

        {/* Sign up */}
        <div className="text-center">
          <p className="text-sm">
            Tôi đã có tài khoản{" "}
            <Link className="text-primary underline" to="/login">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};
