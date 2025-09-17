import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { HomePage } from "./pages/home.page";
import { Banner } from "./components/client/banner/banner";
import { LoginPage } from "./pages/Login.page";
import { RegisterPage } from "./pages/Register.page";
import { useContext } from "react";
import { AuthContext } from "./components/context/auth.context";
import LayoutApp from "./components/share/Layout.app";
import { Spin } from "antd";
import { InfoPage } from "./pages/Info.page";
import { CartPage } from "./pages/Cart.page";
import { CheckOut } from "./components/client/checkout/CheckOut";
import ForgotPassword from "./components/client/forgot/ForgotPassword";
import { DetailCombo } from "./components/client/combos/Detail.page";
import { OrderPage } from "./pages/Order.page";
import IndexPage from "./pages/admin/Index.page";
import ProductAdmin from "./pages/admin/ProductAdmin";
import OrderAdmin from "./pages/admin/OrderAdmin";
import CatalogAdmin from "./pages/admin/CatalogAdmin";
import ProtectedRoute from "./share/ProtectedRoute";

const LayoutClient = () => {
  const { isAppLoading } = useContext(AuthContext);
  return (
    <>
      {isAppLoading === true ? (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50% , -50%)",
          }}
        >
          <Spin />
        </div>
      ) : (
        <>
          <div className="w-[1170px]  mx-auto">
            <Header />
            <Outlet />
            <Footer />
          </div>
        </>
      )}
    </>
  );
};

const LayoutAdmin = () => {
  const { isAppLoading } = useContext(AuthContext);
  return (
    <>
      {isAppLoading === true ? (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50% , -50%)",
          }}
        >
          <Spin />
        </div>
      ) : (
        <>
          <div className="w-[1170px]  mx-auto">
            <Outlet />
          </div>
        </>
      )}
    </>
  );
};

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <LayoutApp>
          <LayoutClient />
        </LayoutApp>
      ),
      //errorElement: <ErrorPage />,
      children: [
        // { index: true, element: <HomePage /> },
        { index: true, element: <HomePage></HomePage> },
        { path: "/info", element: <InfoPage /> },
        { path: "/cart", element: <CartPage /> },
        { path: "/checkout", element: <CheckOut /> },
        { path: "/combos/:id", element: <DetailCombo /> },
        { path: "/order", element: <OrderPage /> },
      ],
    },

    // { path: "/thanks", element: <ThanksPage /> },

    // // Auth Pages
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "/forgot", element: <ForgotPassword /> },

    {
      path: "/admin",
      element: (
        <LayoutApp>
          <ProtectedRoute allowedRoles={["admin"]}>
            <LayoutAdmin />
          </ProtectedRoute>
        </LayoutApp>
      ),
      children: [
        { index: true, element: <IndexPage /> },
        { path: "categories", element: <CatalogAdmin /> },
        { path: "products", element: <ProductAdmin /> },
        { path: "orders", element: <OrderAdmin /> },
        { path: "catalogs", element: <CatalogAdmin /> },
        // { path: "dish", element: <TableDish /> },
        // { path: "info", element: <InfoPageAdmin /> },
        // { path: "order", element: <OrderPageAdmin /> },
        // { path: "user", element: <UserPageAdmin /> },
      ],
    },
    // { path: "/unauthorized", element: <Unauthorized /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
