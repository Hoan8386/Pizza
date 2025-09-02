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

export {
    getAllProducts,
    getAllCategories,
    getProductsByCategory
};
