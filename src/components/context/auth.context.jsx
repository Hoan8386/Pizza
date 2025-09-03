import { createContext, useState } from "react";

const AuthContext = createContext({
  id: null,
  username: "",
  email: "",
  full_name: "",
  address: "",
  phone: "",
  role: "",
});

const AuthWrapper = ({ children }) => {
  const [user, setUser] = useState({
    id: null,
    username: "",
    email: "",
    full_name: "",
    address: "",
    phone: "",
    role: "",
  });

  const [isAppLoading, setIsAppLoading] = useState(true);

  const [cart, setCart] = useState({
    id: 0,
    user_id: null, // nếu muốn lưu cả id user
    totalItems: 0,
    totalPrice: 0,
    items: [], // đảm bảo luôn có mảng rỗng
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAppLoading,
        setIsAppLoading,
        cart,
        setCart,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthWrapper };
