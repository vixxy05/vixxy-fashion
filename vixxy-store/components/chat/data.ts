import type { Conversation, User } from "./types";

export const me: User = {
  id: "me",
  name: "Vixxy",
  avatar: "/images/mu-cai-thien-than.png",
  presence: "online",
};

export const aiAssistant: User = {
  id: "ai",
  name: "AI Assistant",
  avatar: "/images/pearl-eclat-earrings.png",
  presence: "online",
};

const aiResponses = [
  "Xin chào! Tôi là AI Assistant của VIXXY D'ORANCE. Bạn có thể hỏi tôi về sản phẩm, chính sách đổi trả hoặc các chương trình khuyến mãi!",
  "Chúng tôi có nhiều mẫu trang phục và trang sức cao cấp. Bạn đang tìm kiếm loại sản phẩm nào ạ?",
  "Chính sách đổi trả của chúng tôi áp dụng trong 30 ngày cho các sản phẩm còn nguyên tem và hóa đơn.",
  "Hiện tại chúng tôi có chương trình khuyến mãi giảm 15% cho đơn hàng từ 2 triệu đồng.",
  "Bạn có thể xem các sản phẩm mới nhất tại mục 'Sản phẩm' trên trang web của chúng tôi.",
  "Nếu bạn cần hỗ trợ thêm, vui lòng để lại số điện thoại, chúng tôi sẽ liên hệ lại sớm nhất!",
  "Cảm ơn bạn đã quan tâm đến VIXXY D'ORANCE! Chúc bạn có trải nghiệm mua sắm tuyệt vời.",
];

export const getAIResponse = (userMessage: string) => {
  const lowerMsg = userMessage.toLowerCase();
  if (lowerMsg.includes("xin chào") || lowerMsg.includes("chào")) {
    return "Xin chào! Rất vui được hỗ trợ bạn. Bạn cần giúp đỡ về điều gì ạ?";
  }
  if (lowerMsg.includes("sản phẩm")) {
    return "Chúng tôi có nhiều sản phẩm thời trang nữ cao cấp như trang phục, trang sức và phụ kiện. Bạn đang quan tâm loại nào ạ?";
  }
  if (lowerMsg.includes("giá") || lowerMsg.includes("giá cả")) {
    return "Giá của sản phẩm phụ thuộc vào từng loại. Bạn có thể xem chi tiết giá trên trang sản phẩm hoặc cho tôi biết tên sản phẩm bạn quan tâm nhé!";
  }
  if (lowerMsg.includes("đổi trả") || lowerMsg.includes("trả hàng")) {
    return "Chúng tôi hỗ trợ đổi trả trong 30 ngày cho các sản phẩm còn nguyên tem, hóa đơn và chưa qua sử dụng.";
  }
  if (lowerMsg.includes("khuyến mãi") || lowerMsg.includes("giảm giá")) {
    return "Hiện tại chúng tôi có chương trình khuyến mãi giảm 15% cho đơn hàng từ 2 triệu đồng và miễn phí vận chuyển cho đơn từ 500k!";
  }
  if (lowerMsg.includes("liên hệ") || lowerMsg.includes("hotline")) {
    return "Bạn có thể liên hệ chúng tôi qua hotline: 1900.1234 hoặc email: support@vixxy.com để được hỗ trợ nhanh nhất!";
  }
  if (lowerMsg.includes("cảm ơn") || lowerMsg.includes("cảm ơn")) {
    return "Không có gì! Rất vui được hỗ trợ bạn. Nếu có gì cần thêm, hãy hỏi tôi bất cứ lúc nào nhé!";
  }
  return aiResponses[Math.floor(Math.random() * aiResponses.length)];
};

export const seedConversations: Conversation[] = [
  {
    id: "ai",
    name: "AI Assistant",
    isGroup: false,
    avatar: "/images/pearl-eclat-earrings.png",
    members: [me, aiAssistant],
    presence: "online",
    messages: [
      {
        id: "ai1",
        senderId: "ai",
        content: "Xin chào! Tôi là AI Assistant của VIXXY D'ORANCE. Tôi có thể giúp gì cho bạn hôm nay?",
        createdAt: "09:00",
      },
    ],
  },
  {
    id: "c1",
    name: "Design squad",
    isGroup: true,
    avatar: "/images/banner.png",
    members: [
      me,
      {
        id: "u1",
        name: "Linh",
        avatar: "/images/pearl-eclat-earrings.png",
        presence: "online",
      },
      {
        id: "u2",
        name: "Trang",
        avatar: "/images/celeste-gold-bracelet.png",
        presence: "offline",
      },
    ],
    presence: "online",
    messages: [
      {
        id: "m1",
        senderId: "u1",
        content: "UI chat 2026 mình làm tone đen/ghi nhé.",
        createdAt: "10:01",
      },
      {
        id: "m2",
        senderId: "me",
        content: "Ok. Em sẽ làm layout giống Messenger/Discord, bo góc mềm.",
        createdAt: "10:02",
      },
      {
        id: "m3",
        senderId: "u2",
        content: "Nhớ responsive tablet/mobile nữa nha.",
        createdAt: "10:03",
      },
    ],
  },
  {
    id: "c2",
    name: "Support",
    isGroup: false,
    avatar: "/images/auric-minimal-ring.png",
    members: [
      me,
      {
        id: "u3",
        name: "Support",
        avatar: "/images/auric-minimal-ring.png",
        presence: "online",
      },
    ],
    presence: "online",
    messages: [
      {
        id: "m21",
        senderId: "u3",
        content: "Chào bạn, VIXXY D'ORANCE hỗ trợ gì cho bạn ạ?",
        createdAt: "09:42",
      },
    ],
  },
];

