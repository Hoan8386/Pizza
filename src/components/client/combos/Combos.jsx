import { Link } from "react-router-dom";

export const CombosListItem = ({ combos }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
      {combos.map((combo) => (
        <Link
          key={combo.id}
          to={`/combos/${combo.id}`}
          state={{ combo }} // ✅ Truyền toàn bộ combo qua state
          className="bg-white rounded-2xl overflow-hidden shadow-md group cursor-pointer hover:shadow-xl transition-shadow duration-300"
        >
          {/* Ảnh combo */}
          <div className="relative w-full h-70 bg-red-600 flex items-center justify-center overflow-hidden">
            <img
              src={`http://localhost:8000/images${combo.image_url}`}
              alt={combo.name}
              className="object-contain max-h-full max-w-full group-hover:scale-110 transform transition-transform duration-500"
            />
          </div>

          {/* Nội dung combo */}
          <div className="p-4">
            <h3 className="text-lg font-bold uppercase text-gray-800">
              {combo.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Chỉ từ{" "}
              <span className="text-lg font-bold text-gray-900">
                {parseFloat(combo.price).toLocaleString()} ₫
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {combo.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};
