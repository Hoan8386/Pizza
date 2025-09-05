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
        // { path: "/about", element: <AboutPage /> },
        // { path: "/info", element: <PrivateRoute>  <InfoPage /></PrivateRoute> },
        // { path: "/order", element: <PrivateRoute> <OrderPage /> </PrivateRoute> },
      ],
    },

    // { path: "/thanks", element: <ThanksPage /> },

    // // Auth Pages
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    // { path: "/confirm", element: <ConfirmPage /> },
    // { path: "/unauthorized", element: <Unauthorized /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
