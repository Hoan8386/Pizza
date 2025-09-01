import { useEffect, useState } from "react";
import { Banner } from "../components/client/banner/banner";
import Select from "../components/client/select/select";
import { getALlProducts } from "../services/api.service";
import { ProductListItem } from "../components/client/product/Products";

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getALlProducts();
        console.log(result);
        setProducts(result.data); // tùy API trả về
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="w-[1170px]  mx-auto">
        <Select />
        <ProductListItem products={products} />
      </div>
    </>
  );
};
