import { useEffect, useState } from "react";
import { Banner } from "../components/client/banner/banner";
import Select from "../components/client/select/select";
import {
  getAllCategories,
  getProductsByCategory,
} from "../services/api.service";
import { ProductListItem } from "../components/client/product/Products";

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getProductsByCategory(activeIndex + 1);
        setProducts(result.data); // tùy API trả về
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchData();
  }, [activeIndex]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAllCategories();
        // console.log(result);
        setCategories(result.data); // tùy API trả về
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchData();
  }, []);
  // console.log("check category", categories);
  return (
    <>
      <div className="w-[1170px]  mx-auto">
        <Banner />
        <Select
          categories={categories}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />
        <ProductListItem products={products} />
      </div>
    </>
  );
};
