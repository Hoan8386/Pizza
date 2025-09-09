import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../components/context/auth.context";
import { Link } from "react-router-dom";
import {
  UserOutlined,
  GiftOutlined,
  BellOutlined,
  LockOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { changePassword, updateUserApi } from "../services/api.service";
import { toast } from "react-toastify";
import { Button } from "antd";
import ModelResetPassword from "../components/client/resetPassword/RestPassword";

export const InfoPage = () => {
  const { user, setUser } = useContext(AuthContext); // Assume setUser is available to update context
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  // Address state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // Hàm normalize để so sánh tên tránh lỗi dấu, khoảng trắng
  const normalizeText = (text) =>
    text ? text.normalize("NFC").trim().toLowerCase() : "";

  // Lấy provinces khi load trang
  useEffect(() => {
    axios.get("https://provinces.open-api.vn/api/?depth=1").then((res) => {
      setProvinces(res.data);

      if (user.address) {
        const addressParts = user.address.split(",").map((part) => part.trim());

        if (addressParts.length === 3) {
          const [provinceName] = addressParts;
          const province = res.data.find(
            (p) => normalizeText(p.name) === normalizeText(provinceName)
          );
          if (province) {
            setSelectedProvince(province.code);
          }
        }
      }
    });
  }, [user.address]);

  // Lấy districts khi province thay đổi
  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((res) => {
          setDistricts(res.data.districts);
          setWards([]);
          setSelectedDistrict("");
          setSelectedWard("");

          if (user.address) {
            const addressParts = user.address
              .split(",")
              .map((part) => part.trim());
            if (addressParts.length === 3) {
              const [districtName] = addressParts;
              const district = res.data.districts.find(
                (d) => normalizeText(d.name) === normalizeText(districtName)
              );
              if (district) {
                setSelectedDistrict(district.code);
              }
            }
          }
        });
    }
  }, [selectedProvince, user.address]);

  // Lấy wards khi district thay đổi
  useEffect(() => {
    if (selectedDistrict) {
      axios
        .get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((res) => {
          setWards(res.data.wards);
          setSelectedWard("");

          if (user.address) {
            const addressParts = user.address
              .split(",")
              .map((part) => part.trim());
            if (addressParts.length === 3) {
              const [wardName] = addressParts;
              const ward = res.data.wards.find(
                (w) => normalizeText(w.name) === normalizeText(wardName)
              );
              if (ward) {
                setSelectedWard(ward.code);
              }
            }
          }
        });
    }
  }, [selectedDistrict, user.address]);

  const handleEditToggle = () => {
    setIsLoading(false);
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Reset form data to current user data when enabling edit
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
      });
      setSelectedProvince(selectedProvince);
      setSelectedDistrict(selectedDistrict);
      setSelectedWard(selectedWard);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateUser = async () => {
    setIsLoading(true);

    if (!formData.full_name) {
      alert("Vui lòng điền tên khách hàng!");
      return;
    }
    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      alert("Vui lòng chọn đầy đủ địa chỉ!");
      return;
    }

    const fullAddress = `${
      wards.find((w) => w.code === Number(selectedWard))?.name || ""
    }, ${
      districts.find((d) => d.code === Number(selectedDistrict))?.name || ""
    }, ${
      provinces.find((p) => p.code === Number(selectedProvince))?.name || ""
    }`;

    const updatedUserData = {
      email: formData.email,
      full_name: formData.full_name,
      address: fullAddress,
      phone: formData.phone,
      role: formData.role,
    };

    try {
      const res = await updateUserApi(user.id, updatedUserData);
      toast.success("Đăng nhập thành công ");

      setUser(res.data); // Cập nhật context
      setIsEditing(false);
    } catch (err) {
      console.error("Lỗi cập nhật:", err.response?.data || err.message);
      alert("Cập nhật thất bại. Vui lòng thử lại!");
    }
    setIsLoading(false);
  };
  const [isLoadChange, setIsLoadChange] = useState(false);
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState({
    email: user.email,
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const clear = () => {
    setModel({
      email: user.email,
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    });
  };
  const handleOk = async () => {
    try {
      setIsLoadChange(true);
      const res = await changePassword(
        model.current_password,
        model.new_password,
        model.new_password_confirmation
      );

      if (res.data?.message) {
        toast.success("Đổi mật khẩu thành công");
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }

      clear(); // reset form
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi kết nối server");
    } finally {
      setIsLoadChange(false);
      setOpen(false);
    }
  };

  return (
    <>
      <style>
        {`
          .disable {
            background-color: #e5e7eb;
            color: #6b7280;
            cursor: not-allowed;
          }
          .disable:hover {
            cursor: not-allowed;
          }
        `}
      </style>
      <div className="flex items-center justify-between my-4">
        <div className="flex-1">
          <Link to="/" className=" hover:underline items-center gap-2">
            <ArrowLeftOutlined /> Trở lại
          </Link>
        </div>
        <div className="text-left flex-1">
          <h1 className="text-2xl font-bold">Thông Tin Tài Khoản</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-10 gap-6 mt-4">
        {/* Left Sidebar */}
        <div className="md:col-span-3 space-y-6">
          {/* Membership Card */}
          <div className="bg-red-600 text-white rounded-xl p-4 text-center">
            <p className="font-semibold">Thành viên Thường</p>
            <p className="text-sm mt-1">Ngày hết hạn 04/09/2025</p>
            <div className="text-4xl font-bold mt-4">0%</div>
            <p className="text-sm">giảm giá</p>
            <button className="mt-4 w-full border border-white rounded-lg py-2 hover:bg-white hover:text-red-600 transition">
              Hiện mã QR
            </button>
          </div>

          {/* Menu */}
          <div
            className="bg-white rounded-xl  p-2"
            style={{
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            <ul className="space-y-1">
              <li>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <UserOutlined />
                  Hồ sơ của tôi
                </Link>
              </li>
              <li>
                <Link
                  to="/points"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
                >
                  <GiftOutlined />
                  Đổi điểm
                </Link>
              </li>
              <li>
                <Link
                  to="/notifications"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
                >
                  <BellOutlined />
                  Thông báo
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setOpen(true)}
                  to="/change-password"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 w-full"
                >
                  <LockOutlined />
                  Đổi mật khẩu
                </button>
              </li>
            </ul>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-gray-50"
            style={{
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            <LogoutOutlined />
            Đăng xuất
          </button>
        </div>

        {/* Right Profile Form */}
        <div
          className="md:col-span-7 bg-white rounded-xl  p-6"
          style={{
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Hồ Sơ Của Tôi</h2>
            <button
              onClick={handleEditToggle}
              className="text-red-500 hover:underline"
            >
              {isEditing ? "Hủy" : "Chỉnh sửa"}
            </button>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Tên
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                disabled={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 ${
                  isEditing ? "disable" : ""
                }`}
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Số Điện Thoại
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 ${
                  isEditing ? "disable" : ""
                }`}
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Tỉnh/Thành
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                disabled={false}
              >
                <option value="">Chọn tỉnh/thành</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Quận/Huyện
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                disabled={!districts.length}
              >
                <option value="">Chọn quận/huyện</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Xã/Phường
              </label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                disabled={!wards.length}
              >
                <option value="">Chọn xã/phường</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Vai Trò
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 ${
                  isEditing ? "disable" : ""
                }`}
                disabled={isEditing}
              />
            </div>
            {isEditing && (
              <Button
                onClick={updateUser}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                }}
                loading={isLoading}
                text="primary"
              >
                Cập nhật
              </Button>
            )}
          </form>
        </div>
      </div>

      <ModelResetPassword
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleOk}
        model={model}
        setModel={setModel}
        isLoadChange={isLoadChange}
      />
    </>
  );
};
