
import axios from './axios.customize';

// Lấy tất cả sản phẩm
const getAllProducts = () => {
    const URL_BACKEND = "api/products";
    return axios.get(URL_BACKEND);
};

// Lấy tất cả danh mục
const getAllCategories = () => {
    const URL_BACKEND = "api/categories";
    return axios.get(URL_BACKEND);
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
export {
    getAllProducts,
    getAllCategories,
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
 getCombosApi 

};
