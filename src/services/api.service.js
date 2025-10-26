
import axios from './axios.customize';

// Lấy tất cả sản phẩm
const getAllProducts = () => {
    const URL_BACKEND = "api/products";
    return axios.get(URL_BACKEND);
};

// Tạo sản phẩm mới
const createProductApi = (productPayload) => {
    const URL_BACKEND = "/api/products";
    return axios.post(URL_BACKEND, productPayload);
};

// Cập nhật sản phẩm (không bao gồm variants)
const updateProductApi = (id, productPayload) => {
    const URL_BACKEND = `/api/products/${id}`;
    return axios.put(URL_BACKEND, productPayload);
};

// Xóa sản phẩm
const deleteProductApi = (id) => {
    const URL_BACKEND = `/api/products/${id}`;
    return axios.delete(URL_BACKEND);
};

// Lấy tất cả danh mục
const getAllCategories = () => {
    const URL_BACKEND = "api/categories";
    return axios.get(URL_BACKEND);
};

// Category CRUD
const createCategoryApi = (payload) => {
    return axios.post('/api/categories', payload);
}

const updateCategoryApi = (id, payload) => {
    return axios.put(`/api/categories/${id}`, payload);
}

const deleteCategoryApi = (id) => {
    return axios.delete(`/api/categories/${id}`);
}

// Lấy tất cả kích cỡ
const getAllSizes = () => {
    const URL_BACKEND = "/api/sizes";
    return axios.get(URL_BACKEND);
};

// Lấy tất cả đế bánh
const getAllCrusts = () => {
    const URL_BACKEND = "/api/crusts";
    return axios.get(URL_BACKEND);
};

// Tạo đế bánh mới
const createCrustApi = (payload) => {
    return axios.post('/api/crusts', payload);
};

// Cập nhật đế bánh
const updateCrustApi = (id, payload) => {
    return axios.put(`/api/crusts/${id}`, payload);
};

// Xóa đế bánh
const deleteCrustApi = (id) => {
    return axios.delete(`/api/crusts/${id}`);
};

// Lấy sản phẩm theo category_id
const getProductsByCategory = (categoryId) => {
    const URL_BACKEND = `api/products?category_id=${categoryId}`;
    return axios.get(URL_BACKEND);
};


const getCombosApi = ()=>{
 const URL_BACKEND = "/api/combos";
    return axios.get(URL_BACKEND);
}
const createUserApi = (userData) => {
  const URL_BACKEND = "/api/users";

  // userData phải chứa: username, password, email, full_name, address, phone
  const data = {
    password: userData.password,
    email: userData.email,
    full_name: userData.full_name,
    address: userData.address,
    phone: userData.phone,
  };

  return axios.post(URL_BACKEND, data);
};


const loginApi = (email, password) => {

    const URL_BACKEND = "/api/auth/login";
    const data = {
        email: email,
        password: password,

    }
    return axios.post(URL_BACKEND, data)
}

const getAccountAPI = () => {
    const URL_BACKEND = "/api/auth/me";
    return axios.get(URL_BACKEND);
}


const getCart = () => {
    const URL_BACKEND = "/api/cart";
    return axios.get(URL_BACKEND)
}

const apiAddCart = (id,quantity) =>{
     const URL_BACKEND = "/api/cart/items";
    const data = {
        product_variant_id: id,
        quantity: quantity,

    }
    return axios.post(URL_BACKEND, data)
}

const logoutApi = () => {
    const URL_BACKEND = "/api/auth/logout"
     return axios.post(URL_BACKEND);
}

const updateUserApi = (id, updatedUserData) => {
  const URL_BACKEND = `/api/users/${id}`;
  return axios.put(URL_BACKEND, updatedUserData);
};


const getCartApi = () =>{
    const URL_BACKEND =  "/api/cart"
      return axios.get(URL_BACKEND);
}

const updateCartApi = (id,quantity) =>{
    const URL_BACKEND = `/api/cart/items/${id}`
     const data = {
        quantity: quantity,

    }
    return axios.put(URL_BACKEND,data);
}

const deleteCartApi = (id) =>{
    const URL_BACKEND = `/api/cart/items/${id}`
   
    return axios.delete(URL_BACKEND);
}

const getCoupon = (code,order_amount) =>{
    const URL_BACKEND ="/api/coupons/validate"
    const data ={
        code:code,
    order_amount:order_amount
    }
return axios.post(URL_BACKEND,data);
}


const createOrder = (shipping_address,coupon_code) =>{
    const URL_BACKEND ="/api/orders"
    const data ={
        shipping_address:shipping_address,
    coupon_code:coupon_code
    }
return axios.post(URL_BACKEND,data);
}

const checkOutApi = (order_id,amount,method) =>{
    const URL_BACKEND ="/api/orders"
    const data ={
        order_id:order_id,
    amount:amount,
    method:method
    }
return axios.post(URL_BACKEND,data);
}

const forgotPassword = (email) =>{
    const URL_BACKEND = "/api/password/forgot"
   const data ={
        email:email,
    }
    return axios.post(URL_BACKEND,data);
}

const changePassword = (current_password,new_password,new_password_confirmation)=>{
  const URL_BACKEND = "/api/users/change-password"
   const data ={
        current_password:current_password,
        new_password:new_password,
        new_password_confirmation:new_password_confirmation
    }
    return axios.post(URL_BACKEND,data);
}

const addComboCartApi = (combo_id,quantity) =>{
     const URL_BACKEND = "/api/cart/items";
    const data = {
        combo_id: combo_id,
        quantity: quantity,

    }
    return axios.post(URL_BACKEND, data)
}

const getAllFaqs = () =>{
    const URL_BACKEND =  "/api/faqs"
      return axios.get(URL_BACKEND);
}

const updateFaqAnswer = (id, answer) => {
    const URL_BACKEND = `/api/faqs/${id}`;
    return axios.put(URL_BACKEND, { answer });
}

const createFaq = (faqData) => {
    const URL_BACKEND = "/api/faqs";
    return axios.post(URL_BACKEND, faqData);
}
 
 const searchProduct = (keyword) => {
  if (keyword && keyword.trim() !== "") {
    return axios.get("/api/products", {
      params: { search: keyword },
    });
  }
  // Không truyền keyword thì lấy tất cả
  return axios.get("/api/products");
};

const getAllOrder =  () =>{
 const URL_BACKEND =  "/api/orders"
      return axios.get(URL_BACKEND);
}

// Order APIs for admin management
const getOrdersApi = (params = {}) => {
    // expects admin token; backend filters non-admin to own orders
    return axios.get('/api/orders', { params });
}

const updateOrderStatusApi = (orderId, status) => {
    return axios.patch(`/api/orders/${orderId}/status`, { status });
}

const cancelOrderApi = (orderId) => {
    return axios.post(`/api/orders/${orderId}/cancel`);
}

// Dashboard/Revenue
const getDashboardStatsApi = (params = {}) => {
    return axios.get('/api/revenue/dashboard', { params });
}

const getMonthlyRevenueApi = (params = {}) => {
    return axios.get('/api/revenue/monthly', { params });
}

const getTopProductsApi = (params = {}) => {
    return axios.get('/api/revenue/top-products', { params });
}

const getTopCustomersApi = (params = {}) => {
    return axios.get('/api/revenue/top-customers', { params });
}

const getCouponsApi = (params = {}) => {
    return axios.get('/api/revenue/coupons', { params });
}

// Users (for CustomerAdmin & admin management)
const getUsersApi = (params = {}) => axios.get('/api/users', { params });
const createUserByAdminApi = (payload) => axios.post('/api/users', payload);
const updateUserByAdminApi = (id, payload) => axios.put(`/api/users/${id}`, payload);
const deleteUserApi = (id) => axios.delete(`/api/users/${id}`);


const getReviewProductApi = (product_id) =>{
    
    return axios.get("/api/reviews", {
      params: { product_id: product_id },
    });
} 

const reviewProductApi  = (product_id,rating,comment) =>{
     const URL_BACKEND = "/api/reviews";
    const data = {
        product_id: product_id,
        rating: rating,
        comment: comment,

    }
    return axios.post(URL_BACKEND, data)
}

const getAllBannerApi =() =>{
    const URL_BACKEND = "/api/banners";
     return axios.get(URL_BACKEND);
}

const createBannerApi = (payload) => axios.post('/api/banners', payload);
const updateBannerApi = (id, payload) => axios.put(`/api/banners/${id}`, payload);
const deleteBannerApi = (id) => axios.delete(`/api/banners/${id}`);

// News CRUD
const getNewsApi = (params = {}) => axios.get('/api/news', { params });
const createNewsApi = (payload) => axios.post('/api/news', payload);
const updateNewsApi = (id, payload) => axios.put(`/api/news/${id}`, payload);
const deleteNewsApi = (id) => axios.delete(`/api/news/${id}`);
const getAllNews =() =>{
    const URL_BACKEND = "/api/news";
     return axios.get(URL_BACKEND);
}

// Voucher/Coupon CRUD
const getAllVouchersApi = () => {
    const URL_BACKEND = "/api/coupons";
    return axios.get(URL_BACKEND);
};

const createVoucherApi = (payload) => {
    const URL_BACKEND = "/api/coupons";
    return axios.post(URL_BACKEND, payload);
};

const updateVoucherApi = (id, payload) => {
    const URL_BACKEND = `/api/coupons/${id}`;
    return axios.put(URL_BACKEND, payload);
};

const deleteVoucherApi = (id) => {
    const URL_BACKEND = `/api/coupons/${id}`;
    return axios.delete(URL_BACKEND);
};

// Combo CRUD
const getAllCombosApi = () => {
    const URL_BACKEND = "/api/combos";
    return axios.get(URL_BACKEND);
};

const createComboApi = (payload) => {
    return axios.post('/api/combos', payload);
};

const updateComboApi = (id, payload) => {
    return axios.put(`/api/combos/${id}`, payload);
};

const deleteComboApi = (id) => {
    return axios.delete(`/api/combos/${id}`);
};

export {
    getAllProducts,
    createProductApi,
    updateProductApi,
    deleteProductApi,
    getAllCategories,
    createCategoryApi,
    updateCategoryApi,
    deleteCategoryApi,
    getUsersApi,
    createUserByAdminApi,
    updateUserByAdminApi,
    deleteUserApi,
    getAllSizes,
    getAllCrusts,
    createCrustApi,
    updateCrustApi,
    deleteCrustApi,
    getProductsByCategory,
    createUserApi,
    loginApi,
    getAccountAPI,
    getCart,
    apiAddCart,
    logoutApi,
    updateUserApi,
    getCartApi,
    updateCartApi,
    deleteCartApi,
    getCoupon,
    createOrder,
    checkOutApi,
    forgotPassword,
    changePassword,
    getCombosApi ,
    addComboCartApi,
    getAllFaqs,
    updateFaqAnswer,
    createFaq,
    searchProduct,
    getAllOrder,
    getOrdersApi,
    updateOrderStatusApi,
    cancelOrderApi,
    getDashboardStatsApi,
    getMonthlyRevenueApi,
    getTopProductsApi,
    getTopCustomersApi,
    getCouponsApi,
    getReviewProductApi,
    reviewProductApi,
    getAllBannerApi,
    createBannerApi,
    updateBannerApi,
    deleteBannerApi,
    getNewsApi,
    createNewsApi,
    updateNewsApi,
    deleteNewsApi,
    getAllNews,
    getAllVouchersApi,
    createVoucherApi,
    updateVoucherApi,
    deleteVoucherApi,
    getAllCombosApi,
    createComboApi,
    updateComboApi,
    deleteComboApi
};
