import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { HomePage } from "./pages/home.page";
import { Banner } from "./components/client/banner/banner";
import { LoginPage } from "./pages/Login.page";

const LayoutClient = () => {
  return (
    <>
      <div className="w-[1170px]  mx-auto">
        <Header />
        <Banner />
        <Outlet />
        <Footer />
      </div>
    </>
  );
};

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LayoutClient />,
      //errorElement: <ErrorPage />,
      children: [
        // { index: true, element: <HomePage /> },
        { index: true, element: <HomePage></HomePage> },
        { path: "/dish", element: <h1>Dish</h1> },
        // { path: "/about", element: <AboutPage /> },
        // { path: "/info", element: <PrivateRoute>  <InfoPage /></PrivateRoute> },
        // { path: "/order", element: <PrivateRoute> <OrderPage /> </PrivateRoute> },
      ],
    },

    // { path: "/thanks", element: <ThanksPage /> },

    // // Auth Pages
    { path: "/login", element: <LoginPage /> },
    // { path: "/register", element: <RegisterPage /> },
    // { path: "/confirm", element: <ConfirmPage /> },
    // { path: "/unauthorized", element: <Unauthorized /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
