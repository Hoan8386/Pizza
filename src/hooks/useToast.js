import { toast } from "react-toastify";

/**
 * Custom hook để sử dụng toast notifications
 * @returns {Object} Toast functions (success, error, info, warning)
 */
export const useToast = () => {
  const success = (message, options = {}) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  };

  const error = (message, options = {}) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  };

  const info = (message, options = {}) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  };

  const warning = (message, options = {}) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  };

  return { success, error, info, warning };
};
