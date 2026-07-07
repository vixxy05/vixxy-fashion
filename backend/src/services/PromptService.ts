
import db from "../models";

const { ChatbotPrompt, ChatbotKnowledge, Product, Order, OrderDetail, Shipping } = db;

export class PromptService {
  async getSystemPrompt() {
    const activePrompt = await ChatbotPrompt.findOne({ where: { isActive: true } });
    
    if (activePrompt) {
      return activePrompt.promptContent;
    }

    // Default system prompt if none active
    return `Bạn là trợ lý AI của thương hiệu thời trang nữ cao cấp VIXXY D'ORANCE.

Bạn có nhiệm vụ:
* Hỗ trợ khách hàng
* Tư vấn sản phẩm
* Tư vấn thời trang
* Hỗ trợ mua hàng
* Hỗ trợ vận chuyển
* Hỗ trợ thanh toán

Luôn trả lời chuyên nghiệp, lịch sự và đúng ngữ cảnh.

Khi khách hỏi về sản phẩm, hãy tìm kiếm trong cơ sở dữ liệu sản phẩm và trả về danh sách sản phẩm phù hợp.
Khi khách hỏi về đơn hàng, hãy kiểm tra trạng thái đơn hàng.
Khi khách hỏi về chính sách, hãy trả lời từ cơ sở kiến thức.`;
  }

  async getKnowledgeBase() {
    const knowledges = await ChatbotKnowledge.findAll();
    return knowledges.map(k => ({
      category: k.category,
      question: k.question,
      answer: k.answer
    }));
  }

  buildProductContext(products: any[]) {
    if (products.length === 0) return "Không tìm thấy sản phẩm phù hợp.";
    
    return products.map(p => `
- ${p.name}
  - Giá: ${p.discountPrice || p.price} VND
  - Mô tả: ${p.shortDescription}
  - Tồn kho: ${p.stockQuantity}
  - Slug: ${p.slug}
    `.trim()).join("\n");
  }

  buildOrderContext(order: any, orderDetails: any[], shipping?: any) {
    let orderText = `
Đơn hàng #${order.id}
- Tổng tiền: ${order.totalAmount} VND
- Trạng thái: ${order.orderStatus}
- Ngày tạo: ${order.createdAt}
    `.trim();

    if (shipping) {
      orderText += `
- Vận chuyển: ${shipping.carrier}
- Mã tracking: ${shipping.trackingCode}
- Trạng thái vận chuyển: ${shipping.shippingStatus}
      `.trim();
    }

    if (orderDetails.length > 0) {
      orderText += "\n\nSản phẩm:";
      orderDetails.forEach(d => {
        orderText += `
- ${d.product?.name || "Sản phẩm"} x${d.quantity}
  - Giá: ${d.unitPrice} VND
        `.trim();
      });
    }

    return orderText;
  }
}

export default PromptService;
