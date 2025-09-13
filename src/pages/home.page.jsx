import { useEffect, useState } from "react";
import { Banner } from "../components/client/banner/banner";
import Select from "../components/client/select/select";
import {
  getAllCategories,
  getCombosApi,
  getProductsByCategory,
} from "../services/api.service";
import { ProductListItem } from "../components/client/product/Products";
import { CombosListItem } from "../components/client/combos/Combos";
import { QA } from "../components/client/QA/QA";
import { Search } from "../components/client/search/Search";

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(1);
  const [isCombos, setIsCombos] = useState(false);
  useEffect(() => {
    if (activeIndex === 10) {
      setIsCombos(true);
      const fetchCombos = async () => {
        try {
          const result = await getCombosApi();
          setCombos(result.data); // tùy API trả về
          console.log("combos", ...result.data);
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      };
      fetchCombos();
    } else {
      setIsCombos(false);

      const fetchData = async () => {
        try {
          const result = await getProductsByCategory(activeIndex);
          setProducts(result.data); // tùy API trả về
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      };
      fetchData();
    }
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
        {isCombos === true ? (
          <CombosListItem combos={combos} />
        ) : (
          <ProductListItem products={products} />
        )}
        <Search />
        <QA />
      </div>
    </>
  );
};
