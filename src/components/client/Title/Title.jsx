export const Title = ({ title, banner }) => {
  return (
    <>
      <div className="flex items-center w-full p-3">
        {/* Đường line bên trái */}
        <div className="flex-grow border-t border-gray-300"></div>

        {/* Tiêu đề */}
        <span className="px-4 text-2xl font-bold text-gray-800">{title}</span>

        {/* Đường line bên phải */}
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div
        style={{
          height: "147px",
        }}
      >
        <img src={banner} alt="" className="fade-in hover-scale" />
      </div>
    </>
  );
};
