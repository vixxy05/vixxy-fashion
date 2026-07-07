"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function PromotionsPage() {
  const promotions = [
    {
      id: 1,
      title: "Miễn phí vận chuyển",
      subtitle: "Đơn hàng từ 2.000.000đ",
      description: "Miễn phí vận chuyển toàn quốc cho tất cả đơn hàng có giá trị từ 2 triệu đồng. Áp dụng cho tất cả phương thức thanh toán.",
      color: "bg-black",
      textColor: "text-white",
    },
    {
      id: 2,
      title: "Giảm 15%",
      subtitle: "Cho khách hàng mới",
      description: "Đăng ký tài khoản ngay để nhận mã giảm giá 15% cho đơn hàng đầu tiên. Không giới hạn giá trị đơn hàng.",
      color: "bg-neutral-100",
      textColor: "text-black",
    },
    {
      id: 3,
      title: "Combo ưu đãi",
      subtitle: "Mua 2 tặng 1",
      description: "Mua bất kỳ 2 sản phẩm trang sức, tặng ngay 1 sản phẩm phụ kiện theo sở thích. Chương trình áp dụng đến hết tháng này.",
      color: "bg-neutral-900",
      textColor: "text-white",
    },
    {
      id: 4,
      title: "Flash Sale",
      subtitle: "Mỗi tuần 1 đợt",
      description: "Flash sale mỗi cuối tuần với nhiều ưu đãi sốc. Giảm đến 50% cho các sản phẩm trang phục được chọn.",
      color: "bg-neutral-200",
      textColor: "text-black",
    },
  ];

  return (
    <div className="mx-auto max-w-site px-4 py-16 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display text-4xl font-bold md:text-5xl mb-4">Ưu đãi đặc biệt</h1>
        <p className="text-neutral-600 text-lg mb-12 max-w-2xl">
          Khám phá các chương trình khuyến mãi hấp dẫn của VIXXY D'ORANCE. Cập nhật thường xuyên để không bỏ lỡ bất kỳ ưu đãi nào!
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          {promotions.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-8 ${promo.color} ${promo.textColor} transition hover:scale-[1.02]`}
            >
              <div className="text-xs uppercase tracking-widest mb-2 opacity-70">{promo.subtitle}</div>
              <h2 className="font-display text-2xl font-bold mb-4">{promo.title}</h2>
              <p className="opacity-80 mb-6 leading-relaxed">{promo.description}</p>
              <Link
                href="/products"
                className={`inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider ${
                  promo.color === "bg-black" || promo.color === "bg-neutral-900"
                    ? "border-white hover:bg-white hover:text-black"
                    : "border-black hover:bg-black hover:text-white"
                } border-2 px-6 py-3 transition`}
              >
                Mua sắm ngay
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 p-8 border-2 border-black text-center">
          <h3 className="font-display text-2xl font-bold mb-4">Đăng ký nhận tin</h3>
          <p className="text-neutral-600 mb-6 max-w-xl mx-auto">
            Đăng ký email để nhận thông báo sớm nhất về các chương trình khuyến mãi và bộ sưu tập mới của VIXXY D'ORANCE.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email của bạn"
              required
              className="flex-1 border-2 border-black px-4 py-3 text-sm outline-none focus:bg-neutral-50"
            />
            <button
              type="submit"
              className="bg-black text-white px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-neutral-800 transition"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
