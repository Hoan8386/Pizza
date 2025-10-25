import {
  ShoppingCartOutlined,
  UnorderedListOutlined,
  UserOutlined,
  BellOutlined,
} from "@ant-design/icons";
import logo from "../../assets/logo.svg";
import { Popover, Modal, Form, Input, message } from "antd";
import { useContext, useState } from "react";
import { AuthContext } from "../context/auth.context";
import { logoutApi, createFaq } from "../../services/api.service";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, setUser, cart, setIsAppLoading, setCart } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const content = (
    <div>
      <h2>Tiếng Việt</h2>
      <h2>Tiếng Anh</h2>
    </div>
  );

  const [showMenu, setShowMenu] = useState(false);
  const [isFaqModalVisible, setIsFaqModalVisible] = useState(false);
  const [faqSubmitting, setFaqSubmitting] = useState(false);
  const [faqForm] = Form.useForm();

  const handleFaqSubmit = async (values) => {
    setFaqSubmitting(true);
    const response = await createFaq(values);
    console.log("check faq", response);
    if (response.success === true) {
      toast.success(
        "Câu hỏi của bạn đã được ghi nhận và sẽ được trả lời qua emil"
      );
      setIsFaqModalVisible(false);
      faqForm.resetFields();
    } else {
      message.error(response.data?.message || "Có lỗi xảy ra khi gửi câu hỏi!");
    }
    setFaqSubmitting(false);
  };

  const openFaqModal = () => {
    setIsFaqModalVisible(true);
    // Pre-fill thông tin nếu user đã đăng nhập
    if (user?.id) {
      faqForm.setFieldsValue({
        name: user.full_name || "",
        email: user.email || "",
      });
    }
  };

  const handleFaqCancel = () => {
    setIsFaqModalVisible(false);
    faqForm.resetFields();
  };

  const logout = async () => {
    setIsAppLoading(true);
    const res = await logoutApi();
    console.log(res);
    if (res.data.success === true) {
      toast.success(res.message);
      setUser(null);
      setCart(null);
      localStorage.removeItem("token");
      navigate("/");
    } else {
      toast.error("Đăng xuất thất bại");
    }
    setIsAppLoading(false);
  };
  return (
    <>
      <div className="header flex justify-center">
        <div
          className="w-[1170px] flex "
          style={{
            height: "72px",
            padding: "1rem",
          }}
        >
          <div className="flex-1 flex justify-start items-center">
            <h3>Bạn đang ở đâu ?</h3>
          </div>
          <div className="flex-1 flex justify-center items-center ">
            <Link to="/">
              <img
                src={logo}
                alt=""
                style={{
                  height: "42px",
                  margin: "0 auto ",
                  lineHeight: "100%",
                }}
              />
            </Link>
          </div>
          <div className="flex-1  flex justify-end items-center gap-6">
            <Popover
              content={content}
              className="w-[28px] text-center text-red-600 font-bold"
            >
              VI
            </Popover>
            <Link to="/news">
              <div
                className="news flex justify-center items-center"
                style={{
                  fontSize: "1.2rem",
                  border: "1px solid #ccc",
                  padding: "8px 12px",
                  borderRadius: "50px",
                  height: "40px",
                  width: "40px",
                }}
              >
                <BellOutlined />
              </div>
            </Link>
            <Link to="/cart">
              <div
                className="cart flex "
                style={{
                  fontSize: "1.2rem",
                  border: "1px solid #ccc",
                  padding: "8px 12px",
                  borderRadius: "50px",
                  height: "40px",
                }}
              >
                <span
                  style={{
                    fontSize: "1rem",
                  }}
                >
                  {cart?.items?.length || 0}
                </span>
                <ShoppingCartOutlined className="ml-2" />
              </div>
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setShowMenu(true)}
              onMouseLeave={() => setShowMenu(false)}
            >
              <div
                className="info flex"
                style={{
                  fontSize: "1.2rem",
                  border: "1px solid #ccc",
                  padding: "8px 12px",
                  borderRadius: "50px",
                  height: "40px",
                  cursor: "pointer",
                }}
              >
                <UnorderedListOutlined style={{ fontSize: "1rem" }} />
                <UserOutlined className="ml-2" />
              </div>

              {showMenu && (
                <div
                  style={{
                    transition: "1s",
                  }}
                  className="w-[210px] DropDownMenu absolute top-full right-0 bg-white shadow-xl z-10 duration-200 rounded-xl"
                >
                  {!user?.id ? (
                    <>
                      <a
                        href="/login"
                        className="duration-100 block py-3 pl-5 md:py-2 md:pl-4 md:block hover:font-bold hover:text-red-700 cursor-pointer m-0"
                      >
                        Đăng nhập
                      </a>
                      <a
                        href="/register"
                        className="duration-100 block py-3 pl-5 md:py-2 md:pl-4 hover:font-bold hover:text-red-700 cursor-pointer m-0"
                      >
                        Đăng ký
                      </a>
                    </>
                  ) : (
                    <>
                      <Link to="/info">
                        <div className="p-4 border-b border-gray-200">
                          <p className="font-bold truncate">{user.full_name}</p>
                          <p className="text-sm text-gray-600 truncate">
                            {user.email}
                          </p>
                        </div>
                      </Link>
                      <Link
                        to="/order"
                        className="duration-100 block py-3 pl-5 md:py-2 md:pl-4 hover:font-bold hover:text-red-700 cursor-pointer"
                      >
                        Theo dõi đơn hàng
                      </Link>
                    </>
                  )}

                  <div className="bg-gray-300 w-full h-[1px]" />

                  <a
                    href="#"
                    className="duration-100 block py-3 pl-5 md:py-2 md:pl-4 hover:font-bold hover:text-red-700 cursor-pointer"
                  >
                    Đỗi điểm
                  </a>
                  <a
                    href="#"
                    className="duration-100 block py-3 pl-5 md:py-2 md:pl-4 hover:font-bold hover:text-red-700 cursor-pointer"
                  >
                    Hut Rewards
                  </a>
                  <div
                    onClick={openFaqModal}
                    className="duration-100 block py-3 pl-5 md:py-2 md:pl-4 hover:font-bold hover:text-red-700 cursor-pointer"
                  >
                    Hỗ trợ khách hàng
                  </div>

                  {user?.id && (
                    <>
                      <div className="bg-gray-300 w-full h-[1px]" />
                      <button
                        onClick={logout}
                        className="w-full text-left duration-100 py-3 pl-5 md:py-2 md:pl-4 hover:font-bold hover:text-red-700 cursor-pointer"
                      >
                        Đăng xuất
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Đặt câu hỏi hỗ trợ"
        open={isFaqModalVisible}
        onOk={() => faqForm.submit()}
        onCancel={handleFaqCancel}
        okText="Gửi câu hỏi"
        cancelText="Hủy"
        confirmLoading={faqSubmitting}
        width={500}
      >
        <Form form={faqForm} layout="vertical" onFinish={handleFaqSubmit}>
          <Form.Item
            label="Họ tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input placeholder="Nhập họ tên của bạn" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Nhập email của bạn" />
          </Form.Item>
          <Form.Item
            label="Câu hỏi"
            name="question"
            rules={[{ required: true, message: "Vui lòng nhập câu hỏi!" }]}
          >
            <Input.TextArea placeholder="Nhập câu hỏi của bạn..." rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Navbar;
