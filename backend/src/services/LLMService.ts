
import db from "../models";
import ChatbotKnowledge from "../models/ChatbotKnowledge";
import ContextBuilderService from "./ContextBuilderService";

const { Product, ChatbotKnowledge: DBChatbotKnowledge } = db;

export class LLMService {
  private contextBuilder: ContextBuilderService;

  constructor() {
    this.contextBuilder = new ContextBuilderService();
  }

  async generateResponse(userMessage: string, conversationId?: number, userId?: number) {
    const message = userMessage.toLowerCase();

    // 1. Use RAG to find relevant knowledge
    const ragContext = await this.contextBuilder.buildContext(userMessage, conversationId, userId, 5);

    if (ragContext.context) {
      let response = "Dựa trên thông tin của chúng tôi:\n\n";
      response += ragContext.context;
      response += "\nNếu bạn có câu hỏi khác, vui lòng cho tôi biết nhé!";
      return response;
    }

    // 2. Fallback to product search
    const productKeywords = ["váy", "áo", "quần", "đầm", "sản phẩm", "mua", "tìm kiếm"];
    if (productKeywords.some(keyword => message.includes(keyword))) {
      const productResult = await this.searchProducts(message);
      if (productResult) {
        return productResult;
      }
    }

    // 3. Default greeting/help
    if (message.includes("xin chào") || message.includes("chào")) {
      return "Xin chào! Tôi là AI Assistant của VIXXY D'ORANCE. Tôi có thể giúp bạn tìm sản phẩm, tư vấn thời trang, giải đáp về chính sách đổi trả, thanh toán, vận chuyển... Bạn cần hỗ trợ gì hôm nay?";
    }

    // 4. Policy questions
    if (message.includes("đổi trả") || message.includes("trả hàng")) {
      return "Chính sách đổi trả của chúng tôi áp dụng trong 30 ngày cho các sản phẩm còn nguyên tem, hóa đơn và chưa qua sử dụng. Vui lòng liên hệ hotline 1900.1234 để được hỗ trợ chi tiết!";
    }

    if (message.includes("thanh toán") || message.includes("zalo") || message.includes("momo")) {
      return "Chúng tôi hỗ trợ nhiều phương thức thanh toán: ZaloPay, MoMo, VNPay và COD (thanh toán khi nhận hàng). Tất cả đều an toàn và tiện lợi!";
    }

    if (message.includes("vận chuyển") || message.includes("giao hàng")) {
      return "Chúng tôi hợp tác với các đơn vị vận chuyển uy tín như GHN, GHTK, Viettel Post. Thời gian giao hàng từ 2-5 ngày làm việc tùy khu vực!";
    }

    return "Xin lỗi, hiện tại tôi chưa có thông tin về câu hỏi này. Vui lòng cho tôi biết thêm chi tiết hoặc liên hệ hotline 1900.1234 để được hỗ trợ!";
  }

  private async searchProducts(message: string) {
    const products = await Product.findAll({ where: { isActive: true } as any, limit: 5 });
    if (products.length === 0) {
      return null;
    }

    let response = "Dưới đây là một số sản phẩm phù hợp:\n\n";
    products.forEach((product, index) => {
      response += `${index + 1}. ${product.name}\n`;
      response += `   Giá: ${product.price.toLocaleString('vi-VN')}đ\n`;
      if (product.discountPrice) {
        response += `   Giá khuyến mãi: ${product.discountPrice.toLocaleString('vi-VN')}đ\n`;
      }
      response += `   ${product.description?.substring(0, 100)}...\n\n`;
    });
    response += "Bạn có thể xem chi tiết sản phẩm trên trang web hoặc cho tôi biết nếu bạn quan tâm sản phẩm nào nhé!";
    return response;
  }
}

export default LLMService;
