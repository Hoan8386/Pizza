import { useState, useEffect } from "react";
import { getAllFaqs } from "../../../services/api.service";
import { Button } from "antd";

export const QA = () => {
  const [faqs, setFaqs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await getAllFaqs();
        if (res.data) {
          setFaqs(res.data);
        }
      } catch (err) {
        console.error("Error fetching FAQs:", err);
      }
    };

    fetchFaqs();
  }, []);

  // Tính toán dữ liệu theo trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFaqs = faqs.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(faqs.length / itemsPerPage);

  return (
    <div className="max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Câu hỏi thường gặp
      </h1>

      <div className="space-y-4">
        {currentFaqs.map((faq) => (
          <div
            key={faq.id}
            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white"
          >
            <h2 className="font-semibold text-lg text-gray-800">
              {faq.question}
            </h2>
            <p className="text-gray-600 mt-2">{faq.answer}</p>
          </div>
        ))}
      </div>

      {/* Nút chuyển trang */}
      <div className="flex justify-center gap-2 mt-6">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Trước
        </Button>
        <span className="self-center">
          Trang {currentPage}/{totalPages}
        </span>
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  );
};
