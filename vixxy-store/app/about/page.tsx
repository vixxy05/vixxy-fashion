"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-site px-4 py-16 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="font-display text-4xl font-bold md:text-5xl mb-8">Về VIXXY D'ORANCE</h1>
        
        <div className="space-y-6 text-neutral-700 text-lg leading-relaxed">
          <p>
            <strong className="text-black">VIXXY D'ORANCE</strong> là thương hiệu thời trang cao cấp được xây dựng với niềm đam mê về sự sang trọng và tinh tế. Chúng tôi mang đến những thiết kế độc đáo, kết hợp giữa phong cách hiện đại và nét đẹp vĩnh cửu.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 py-8">
            <div className="text-center p-6 border border-neutral-200">
              <div className="text-3xl font-bold text-black mb-2">5+</div>
              <div className="text-sm uppercase tracking-wider">Năm kinh nghiệm</div>
            </div>
            <div className="text-center p-6 border border-neutral-200">
              <div className="text-3xl font-bold text-black mb-2">10K+</div>
              <div className="text-sm uppercase tracking-wider">Khách hàng</div>
            </div>
            <div className="text-center p-6 border border-neutral-200">
              <div className="text-3xl font-bold text-black mb-2">100%</div>
              <div className="text-sm uppercase tracking-wider">Cam kết chất lượng</div>
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold mt-12 mb-4">Sứ mệnh của chúng tôi</h2>
          <p>
            Chúng tôi tin rằng mỗi người đều có quyền tự tin thể hiện phong cách riêng. VIXXY D'ORANCE nỗ lực mỗi ngày để mang đến những sản phẩm chất lượng cao, giúp bạn tỏa sáng trong mọi khoảnh khắc.
          </p>

          <h2 className="font-display text-2xl font-bold mt-12 mb-4">Giá trị cốt lõi</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-black">Chất lượng:</strong> Mỗi sản phẩm đều được chọn lọc kỹ lưỡng từ vật liệu đến quy trình sản xuất</li>
            <li><strong className="text-black">Tinh tế:</strong> Thiết kế tối giản nhưng đầy ấn tượng</li>
            <li><strong className="text-black">Khách hàng:</strong> Trải nghiệm mua sắm tuyệt vời là ưu tiên hàng đầu</li>
          </ul>

          <div className="mt-12 p-8 bg-neutral-50 border border-neutral-200 text-center">
            <p className="text-xl italic text-neutral-600">
              &ldquo;Thời trang không chỉ là quần áo, mà là cách bạn thể hiện bản thân.&rdquo;
            </p>
            <p className="mt-4 font-semibold text-black">— Đội ngũ VIXXY D'ORANCE</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
