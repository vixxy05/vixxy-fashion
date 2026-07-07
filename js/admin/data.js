(function () {
  const parsePrice = (s) => Number(String(s).replace(/[^\d]/g, "")) || 0;

  const clothing = (window.CLOTHING_CATALOG || []).map((p, i) => ({
    id: "tp-" + String(i + 1).padStart(2, "0"),
    name: p.name,
    category: "Trang phục",
    price: parsePrice(p.price),
    image: "../images/clothing/" + p.img,
    description: "Trang phục cao cấp VIXXY D'ORANCE — chất liệu premium, form dáng chuẩn couture.",
    stock: 20 + (i % 8),
    sold: 0,
  }));

  const extras = [
    { id: "ts-01", name: "Pearl Éclat Drop Earrings", category: "Trang sức", price: 8900000, image: "../images/pearl-eclat-earrings.png", description: "Bông tai ngọc trai và pha lê.", stock: 42, sold: 0 },
    { id: "ts-02", name: "Golden Dew Pendant Necklace", category: "Trang sức", price: 12500000, image: "../images/golden-dew-necklace.png", description: "Dây chuyền mặt ngọc giọt sương.", stock: 35, sold: 0 },
    { id: "ts-03", name: "Celeste Gold Charm Bracelet", category: "Trang sức", price: 7200000, image: "../images/celeste-gold-bracelet.png", description: "Vòng tay charm vàng hồng.", stock: 28, sold: 0 },
    { id: "ts-04", name: "Auric Minimal Ring", category: "Trang sức", price: 5600000, image: "../images/auric-minimal-ring.png", description: "Nhẫn ngọc trai halo pha lê.", stock: 50, sold: 0 },
    { id: "pk-01", name: "Túi Xách Dạ Yến Tinh Khôi", category: "Phụ kiện", price: 18900000, image: "../images/tui-xach-da-yen.png", description: "Túi da cấu trúc khóa vàng.", stock: 25, sold: 0 },
    { id: "pk-02", name: "Gót Sen Nắng Hạ", category: "Phụ kiện", price: 9800000, image: "../images/got-sen-nang-ha.png", description: "Giày cao gót vàng mirror.", stock: 30, sold: 0 },
    { id: "pk-03", name: "Thắt Lưng Hào Quang", category: "Phụ kiện", price: 4500000, image: "../images/that-lung-hao-quang.png", description: "Thắt lưng xích vàng khóa hex.", stock: 40, sold: 0 },
    { id: "pk-04", name: "Mũ Cài Thiên Thần Nhỏ", category: "Phụ kiện", price: 3200000, image: "../images/mu-cai-thien-than.png", description: "Fascinator lụa đính hoa hồng.", stock: 22, sold: 0 },
  ];

  const defaultSold = {
    "Crystal Falls Couture Gown": 18,
    "Winter Aurora": 24,
    "Midnight Sovereign Gown": 31,
    "Spring Blossom": 15,
    "Ivory Ruffle Train Gown": 12,
    "Pearl Éclat Drop Earrings": 45,
    "Golden Dew Pendant Necklace": 28,
    "Túi Xách Dạ Yến Tinh Khôi": 19,
  };

  window.ADMIN_DATA = {
    stats: {
      revenue: 2847500000,
      orders: 1284,
      users: 8642,
      growth: 18.6,
    },
    revenueByMonth: [
      { month: "T1", value: 180 }, { month: "T2", value: 210 }, { month: "T3", value: 195 },
      { month: "T4", value: 240 }, { month: "T5", value: 265 }, { month: "T6", value: 285 },
      { month: "T7", value: 310 }, { month: "T8", value: 295 }, { month: "T9", value: 330 },
      { month: "T10", value: 360 }, { month: "T11", value: 390 }, { month: "T12", value: 420 },
    ],
    categories: [
      { name: "Trang phục", share: 52, color: "#6366f1" },
      { name: "Trang sức", share: 28, color: "#a855f7" },
      { name: "Phụ kiện", share: 20, color: "#ec4899" },
    ],
    orders: [
      { id: "VX-240601", customer: "Nguyễn Minh Anh", product: "Crystal Falls Couture Gown", category: "Trang phục", total: 79900000, status: "paid", date: "02/06/2026" },
      { id: "VX-240602", customer: "Trần Thu Hà", product: "Pearl Éclat Drop Earrings", category: "Trang sức", total: 8900000, status: "shipping", date: "02/06/2026" },
      { id: "VX-240603", customer: "Lê Phương Vy", product: "Túi Xách Dạ Yến Tinh Khôi", category: "Phụ kiện", total: 18900000, status: "pending", date: "01/06/2026" },
      { id: "VX-240604", customer: "Phạm Quỳnh Anh", product: "Winter Aurora", category: "Trang phục", total: 24900000, status: "paid", date: "01/06/2026" },
      { id: "VX-240605", customer: "Hoàng Bảo Ngọc", product: "Golden Dew Pendant Necklace", category: "Trang sức", total: 12500000, status: "cancelled", date: "31/05/2026" },
      { id: "VX-240606", customer: "Đỗ Khánh Linh", product: "Midnight Sovereign Gown", category: "Trang phục", total: 12900000, status: "shipping", date: "31/05/2026" },
      { id: "VX-240607", customer: "Vũ Thanh Tú", product: "Thắt Lưng Hào Quang", category: "Phụ kiện", total: 4500000, status: "paid", date: "30/05/2026" },
      { id: "VX-240608", customer: "Bùi Hồng Nhung", product: "Spring Blossom", category: "Trang phục", total: 19900000, status: "paid", date: "30/05/2026" },
      { id: "VX-240609", customer: "Ngô Diệu Linh", product: "Celeste Gold Charm Bracelet", category: "Trang sức", total: 7200000, status: "pending", date: "29/05/2026" },
      { id: "VX-240610", customer: "Mai Gia Hân", product: "Gót Sen Nắng Hạ", category: "Phụ kiện", total: 9800000, status: "shipping", date: "29/05/2026" },
      { id: "VX-240611", customer: "Trịnh Yến Nhi", product: "Ivory Ruffle Train Gown", category: "Trang phục", total: 45900000, status: "paid", date: "28/05/2026" },
      { id: "VX-240612", customer: "Lý Bích Ngọc", product: "Auric Minimal Ring", category: "Trang sức", total: 5600000, status: "paid", date: "28/05/2026" },
    ],
    users: [
      { name: "Nguyễn Minh Anh", email: "minhanh@email.com", orders: 12, tier: "VIP" },
      { name: "Trần Thu Hà", email: "thuha@email.com", orders: 8, tier: "Gold" },
      { name: "Lê Phương Vy", email: "phuongvy@email.com", orders: 5, tier: "Silver" },
    ],
    products: [...clothing, ...extras].map((p, i) => ({
      ...p,
      sold: defaultSold[p.name] ?? ((i * 3 + 5) % 17 + 3),
    })),
  };
})();
