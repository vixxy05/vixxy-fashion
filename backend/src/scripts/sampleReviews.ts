
export interface SampleReview {
  fullName: string;
  email: string;
  avatar: string;
  city: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  size?: string;
  color?: string;
  likesCount: number;
  helpfulCount: number;
  hasPurchased: boolean;
  createdAt: Date;
}

export const sampleReviews: SampleReview[] = [
  {
    fullName: "Nguyễn Thị Ánh",
    email: "anh.nguyen@email.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    city: "Hà Nội",
    rating: 5,
    title: "Sản phẩm tuyệt vời!",
    comment: "Áo sơmi chất vải mềm mại, màu sắc như hình, may kỹ lưỡng. Rất hài lòng với sản phẩm này!",
    images: [
      "https://coresg-normal.trae.ai/api/v1/text_to_image?prompt=white%20cotton%20shirt%20on%20hanger&image_size=square",
      "https://coresg-normal.trae.ai/api/v1/text_to_image?prompt=white%20cotton%20shirt%20detail&image_size=square"
    ],
    size: "M",
    color: "Trắng",
    likesCount: 12,
    helpfulCount: 8,
    hasPurchased: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
  },
  {
    fullName: "Trần Văn Nam",
    email: "nam.tran@email.com",
    avatar: "https://i.pravatar.cc/150?img=2",
    city: "TP. Hồ Chí Minh",
    rating: 4,
    title: "Đẹp nhưng hơi chật",
    comment: "Chất vải tốt, màu đẹp nhưng mình nên chọn size L thay vì M. Tổng thể vẫn rất ưng ý!",
    size: "M",
    color: "Xanh dương",
    likesCount: 7,
    helpfulCount: 5,
    hasPurchased: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
  },
  {
    fullName: "Lê Thị Mai",
    email: "mai.le@email.com",
    avatar: "https://i.pravatar.cc/150?img=3",
    city: "Đà Nẵng",
    rating: 5,
    title: "Quyền lực cổ điển",
    comment: "Quần tây chất lượng cao, may đẹp, mặc thoải mái. Dễ phối đồ cho nhiều dịp!",
    images: [
      "https://coresg-normal.trae.ai/api/v1/text_to_image?prompt=dark%20blue%20tailored%20pants&image_size=square"
    ],
    size: "30",
    color: "Xanh navy",
    likesCount: 15,
    helpfulCount: 10,
    hasPurchased: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
  },
  {
    fullName: "Phạm Văn Hùng",
    email: "hung.pham@email.com",
    avatar: "https://i.pravatar.cc/150?img=4",
    city: "Hải Phòng",
    rating: 3,
    title: "Bình thường",
    comment: "Sản phẩm không như mong đợi quá nhiều, chất lượng trung bình so với giá tiền.",
    size: "L",
    color: "Đen",
    likesCount: 2,
    helpfulCount: 1,
    hasPurchased: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
  },
  {
    fullName: "Đỗ Thị Hồng",
    email: "hong.do@email.com",
    avatar: "https://i.pravatar.cc/150?img=5",
    city: "Cần Thơ",
    rating: 5,
    title: "Không thể thiếu",
    comment: "Áo khoác bomber mặc cực xinh, chất vải dày dặn, giữ ấm tốt. Màu sắc hợp gu!",
    images: [
      "https://coresg-normal.trae.ai/api/v1/text_to_image?prompt=green%20bomber%20jacket&image_size=square",
      "https://coresg-normal.trae.ai/api/v1/text_to_image?prompt=green%20bomber%20jacket%20fit&image_size=square"
    ],
    size: "S",
    color: "Xanh lá",
    likesCount: 20,
    helpfulCount: 14,
    hasPurchased: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10)
  },
  {
    fullName: "Bùi Văn Sơn",
    email: "son.bui@email.com",
    avatar: "https://i.pravatar.cc/150?img=6",
    city: "Huế",
    rating: 4,
    title: "Tạm ổn",
    comment: "Vải đẹp nhưng thời gian giao hàng hơi lâu. Tổng thể vẫn ưng ý!",
    size: "XL",
    color: "Đỏ",
    likesCount: 5,
    helpfulCount: 3,
    hasPurchased: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48)
  },
  {
    fullName: "Hoàng Thị Lan",
    email: "lan.hoang@email.com",
    avatar: "https://i.pravatar.cc/150?img=7",
    city: "Vũng Tàu",
    rating: 5,
    title: "Tuyệt tác!",
    comment: "Đầm midi mặc đẹp rạng rỡ, vải mềm nhẹ, may tỉ mỉ. Rất khuyến nghị!",
    images: [
      "https://coresg-normal.trae.ai/api/v1/text_to_image?prompt=floral%20midi%20dress&image_size=square"
    ],
    size: "S",
    color: "Hoa nhí",
    likesCount: 25,
    helpfulCount: 18,
    hasPurchased: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72)
  },
  {
    fullName: "Trịnh Văn Tuấn",
    email: "tuan.trinh@email.com",
    avatar: "https://i.pravatar.cc/150?img=8",
    city: "Thái Nguyên",
    rating: 4,
    title: "Phong cách hiện đại",
    comment: "Áo thun cotton mềm, in đẹp. Mặc thoải mái, rửa nhiều lần không ra màu!",
    size: "L",
    color: "Xám",
    likesCount: 10,
    helpfulCount: 6,
    hasPurchased: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96)
  },
  {
    fullName: "Ngô Thị Ngọc",
    email: "ngoc.ngo@email.com",
    avatar: "https://i.pravatar.cc/150?img=9",
    city: "Quy Nhơn",
    rating: 5,
    title: "Quà tuyệt vời",
    comment: "Mua làm quà tặng bạn thân, bạn ấy rất thích! Giá hợp lý, chất lượng tốt!",
    images: [
      "https://coresg-normal.trae.ai/api/v1/text_to_image?prompt=fashion%20gift%20boxed&image_size=square"
    ],
    size: "M",
    color: "Vàng nhạt",
    likesCount: 18,
    helpfulCount: 11,
    hasPurchased: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120)
  },
  {
    fullName: "Vũ Văn Quang",
    email: "quang.vu@email.com",
    avatar: "https://i.pravatar.cc/150?img=10",
    city: "Nha Trang",
    rating: 4,
    title: "Thoải mái và phong cách",
    comment: "Quần short jean mặc thoải, chất liệu tốt, không nhăn nhiều!",
    size: "32",
    color: "Xanh nhạt",
    likesCount: 8,
    helpfulCount: 4,
    hasPurchased: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 144)
  },
  {
    fullName: "Nguyễn Thị Minh",
    email: "minh.nguyen@email.com",
    avatar: "https://i.pravatar.cc/150?img=11",
    city: "Phú Quốc",
    rating: 5,
    title: "Hạnh phúc",
    comment: "Đã mua nhiều lần ở đây, luôn hài lòng với chất lượng và dịch vụ!",
    size: "S",
    color: "Tím",
    likesCount: 30,
    helpfulCount: 22,
    hasPurchased: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 168)
  },
  {
    fullName: "Lê Văn Hoàng",
    email: "hoang.le@email.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    city: "Hạ Long",
    rating: 3,
    title: "Chấp nhận được",
    comment: "Giá hợp lý nhưng chất lượng chỉ trung bình. Mặc cũng được thôi.",
    size: "M",
    color: "Nâu",
    likesCount: 3,
    helpfulCount: 2,
    hasPurchased: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 192)
  }
];

