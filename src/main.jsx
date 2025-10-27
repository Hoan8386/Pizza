import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthWrapper } from "./components/context/auth.context.jsx";
import { ToastContainer } from "react-toastify";
import ChatbotWidget from "./components/Chatbot.jsx";

createRoot(document.getElementById("root")).render(
  <AuthWrapper>
    <ToastContainer />

    <App />
  </AuthWrapper>
);
