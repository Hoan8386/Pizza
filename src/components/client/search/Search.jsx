import { useEffect, useState } from "react";
import { searchProduct, getCombosApi } from "../../../services/api.service";
import { ProductListItem } from "../product/Products";
import { CombosListItem } from "../combos/Combos";

export const Search = () => {
  const [keyword, setKeyword] = useState("");
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (!keyword || keyword.trim() === "") {
        // Không có keyword → load tất cả sản phẩm + combo
        const [productsResult, combosResult] = await Promise.all([
          searchProduct(""),
          getCombosApi(),
        ]);
        setProducts(productsResult.data || []);
        setCombos(combosResult.data || []);
      } else {
        // Có keyword → tìm sản phẩm + combo theo API
        const productsResult = await searchProduct(keyword);
        const combosResult = await getCombosApi();
        const filteredCombos = combosResult.data.filter((c) =>
          c.name.toLowerCase().includes(keyword.toLowerCase())
        );
        setProducts(productsResult.data || []);
        setCombos(filteredCombos || []);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setProducts([]);
      setCombos([]);
    } finally {
      setLoading(false);
    }
  };

  // Gọi khi nhấn Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Load dữ liệu lần đầu
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="mb-8 mt-10">
      <label className="block mb-2 font-medium text-2xl text-gray-600">
        Tìm kiếm sản phẩm / combo
      </label>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nhập từ khóa..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border rounded-lg px-3 py-4 w-full  focus:ring-red-800"
        />
        <button
          onClick={handleSearch}
          className="bg-red-700 w-[200px] text-white px-4 py-2 rounded-lg hover:bg-red-800 transition"
        >
          Tìm kiếm
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : combos.length > 0 ? (
        <CombosListItem combos={combos} />
      ) : products.length > 0 ? (
        <ProductListItem products={products} />
      ) : (
        <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm nào</p>
      )}
    </div>
  );
};
