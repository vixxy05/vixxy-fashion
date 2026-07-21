/**
 * Trợ lý ảo VIXXY — trả lời tự động theo từ khóa, chạy hoàn toàn ở client,
 * không cần API key và không tốn phí. Admin vẫn có thể trả lời tay đè lên bất cứ lúc nào.
 *
 * Cách hoạt động: chuẩn hóa câu hỏi của khách (bỏ dấu, chữ thường) rồi so khớp
 * với danh sách chủ đề bên dưới. Khớp chủ đề nào thì trả câu tương ứng; không
 * khớp gì thì trả câu mặc định để chuyển tiếp cho admin.
 *
 * Muốn thêm/sửa nội dung: chỉ cần chỉnh mảng `KNOWLEDGE`.
 */

/** Bỏ dấu tiếng Việt + chữ thường để so khớp không phụ thuộc dấu. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

interface Topic {
  keywords: string[];
  answer: string;
}

const KNOWLEDGE: Topic[] = [
  {
    keywords: ["size", "so do", "chon size", "kich thuoc", "vua khong", "form"],
    answer:
      "Về chọn size: bạn cho em xin chiều cao và cân nặng nhé, em sẽ tư vấn size phù hợp. " +
      "Bảng size chi tiết có ở mỗi trang sản phẩm (mục 'Hướng dẫn chọn size').",
  },
  {
    keywords: ["doi tra", "tra hang", "hoan tra", "doi hang", "return", "30 ngay"],
    answer:
      "Chính sách đổi trả: VIXXY hỗ trợ đổi/trả trong 30 ngày kể từ khi nhận hàng, " +
      "sản phẩm còn nguyên tag và chưa qua sử dụng. Phí đổi trả do lỗi shop thì shop chịu.",
  },
  {
    keywords: ["van chuyen", "ship", "giao hang", "bao lau", "thoi gian giao", "phi ship", "freeship"],
    answer:
      "Thời gian vận chuyển: nội thành 1–2 ngày, tỉnh khác 3–5 ngày làm việc. " +
      "Miễn phí vận chuyển cho đơn từ 500.000đ.",
  },
  {
    keywords: ["thanh toan", "chuyen khoan", "tra tien", "payment", "cod", "bank", "the"],
    answer:
      "Thanh toán: VIXXY nhận chuyển khoản ngân hàng, ví điện tử và COD (thanh toán khi nhận hàng). " +
      "Với chuyển khoản, bạn ghi mã đơn vào nội dung để shop đối soát nhanh nhé.",
  },
  {
    keywords: ["gio hang", "dat hang", "mua hang", "order", "cach mua"],
    answer:
      "Cách đặt hàng: chọn sản phẩm → thêm vào giỏ → vào Giỏ hàng → điền thông tin và xác nhận. " +
      "Nếu cần em hỗ trợ đặt giúp, bạn để lại tên sản phẩm nhé.",
  },
  {
    keywords: ["ma giam", "giam gia", "khuyen mai", "voucher", "uu dai", "coupon", "sale"],
    answer:
      "Ưu đãi: các mã giảm giá và chương trình khuyến mãi hiện có nằm ở mục 'Ưu đãi' trên menu. " +
      "Nhập mã ở bước thanh toán để được giảm nhé.",
  },
  {
    keywords: ["xin chao", "chao", "hello", "hi", "alo"],
    answer: "Dạ VIXXY xin chào! Em có thể giúp gì cho bạn về sản phẩm, đơn hàng hay chính sách ạ?",
  },
  {
    keywords: ["cam on", "thanks", "thank you", "tks"],
    answer: "Dạ không có gì ạ! Bạn cần hỗ trợ thêm gì cứ nhắn em nhé. 🧡",
  },
];

const FALLBACK =
  "Cảm ơn bạn đã nhắn tin cho VIXXY! Em đã ghi nhận và sẽ có nhân viên CSKH trả lời trực tiếp trong ít phút. " +
  "Trong lúc chờ, bạn có thể hỏi em về size, đổi trả, vận chuyển hoặc thanh toán nhé.";

/**
 * Sinh câu trả lời tự động cho tin nhắn của khách.
 * Luôn trả về một chuỗi (dùng FALLBACK khi không khớp chủ đề nào).
 */
export function getBotReply(userText: string): string {
  const text = normalize(userText);
  for (const topic of KNOWLEDGE) {
    if (topic.keywords.some((kw) => text.includes(kw))) {
      return topic.answer;
    }
  }
  return FALLBACK;
}
