import { useContext, useEffect } from "react";
import { AuthContext } from "../context/auth.context";
import { getAccountAPI, getCart } from "../../services/api.service";

const LayoutApp = (props) => {
  const { setUser, setIsAppLoading, setCart } = useContext(AuthContext);
  useEffect(() => {
    fetchUserInfo();
    fetchCart();
  }, []);

  const fetchUserInfo = async () => {
    const res = await getAccountAPI();
    if (res.data) {
      setUser(res.data.user);
    }
    setIsAppLoading(false);
  };

  const fetchCart = async () => {
    const res = await getCart();
    if (res.data) {
      setCart({
        id: res.data.cart.id,
        user_id: res.data.cart.user_id,
        totalItems: res.data.items.length,
        totalPrice: res.data.total,
        items: res.data.items,
      });
    }
  };

  return <>{props.children}</>;
};

export default LayoutApp;
