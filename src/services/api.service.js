// import axios from "axios";
import { Avatar } from 'antd';
import axios from './axios.customize';
const getALlProducts = () => {

    const URL_BACKEND = "api/product-variants";
    
    return axios.get(URL_BACKEND)}


export {
  getALlProducts
} 