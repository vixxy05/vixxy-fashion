import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto grid min-h-[368px] max-w-site gap-10 px-6 py-12 md:grid-cols-3 md:gap-12 md:px-12">
        <div>
          <h2 className="font-display text-3xl font-bold">VIXXY D&apos;ORANCE</h2>
          <p className="mt-2 text-sm font-semibold tracking-wide">
            CÔNG TY CỔ PHẦN THỜI TRANG
          </p>
          <ul className="mt-6 space-y-2 text-sm text-white/85">
            <li>Hotline: 1900 2005</li>
            <li>8:30 – 19:00 tất cả các ngày trong tuần</li>
            <li>2A BCD, Phường E, TP.HCM</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest">
            Hỗ trợ khách hàng
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-white/85">
            {[
              "Hỏi đáp",
              "Chính sách vận chuyển",
              "Hướng dẫn thanh toán",
              "Quy định đổi hàng",
              "Hướng dẫn mua hàng",
            ].map((t) => (
              <li key={t}>
                <Link href="#" className="hover:underline">
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Kết nối</h3>
          <div className="mt-4 flex gap-3">
            {["f", "ig", "tt"].map((s) => (
              <span
                key={s}
                className="flex h-9 w-9 items-center justify-center border border-white/30 text-sm"
              >
                {s}
              </span>
            ))}
          </div>
          <h3 className="mt-8 text-sm font-bold">Phương thức thanh toán</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {["TIỀN MẶT", "VISA", "MC", "JCB"].map((p) => (
              <span
                key={p}
                className="rounded bg-white px-2 py-1 text-[10px] font-bold text-black"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
