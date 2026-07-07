
import db from "../models";
import CartService from "./CartService";
import RecommendationEngine from "./RecommendationEngine";
import LLMService from "./LLMService";
import ConversationService from "./ConversationService";
import MessageService from "./MessageService";

const { AISalesSession, AIActionLog } = db;

export class AISellingService {
  private cartService: CartService;
  private recommendationEngine: RecommendationEngine;
  private llmService: LLMService;
  private conversationService: ConversationService;
  private messageService: MessageService;

  constructor() {
    this.cartService = new CartService();
    this.recommendationEngine = new RecommendationEngine();
    this.llmService = new LLMService();
    this.conversationService = new ConversationService();
    this.messageService = new MessageService();
  }

  async getOrCreateSession(userId: number, conversationId?: number) {
    let session = await AISalesSession.findOne({
      where: { userId, sessionStatus: "ACTIVE" },
    });

    if (!session) {
      session = await AISalesSession.create({
        userId,
        conversationId,
        sessionStatus: "ACTIVE",
        totalInteractions: 0,
      });
    }

    return session;
  }

  async logAction(
    sessionId: number,
    actionType: "SEARCH_PRODUCT" | "RECOMMEND_PRODUCT" | "ADD_TO_CART" | "UPDATE_CART" | "REMOVE_CART" | "CREATE_ORDER" | "PAYMENT_GUIDE",
    actionData?: object
  ) {
    await AIActionLog.create({ sessionId, actionType, actionData });
    await AISalesSession.increment({ totalInteractions: 1 }, { where: { id: sessionId } });
  }

  async processMessage(
    userId: number,
    message: string,
    conversationId?: number
  ) {
    const session = await this.getOrCreateSession(userId, conversationId);
    const messageLower = message.toLowerCase();

    let aiMessage = "";
    let recommendedProducts: any[] = [];
    let cartActions: any[] = [];
    let nextStep: string | null = null;

    // 1. Check for cart commands
    if (messageLower.includes("thêm") && messageLower.includes("giỏ")) {
      const products = await this.recommendationEngine.searchProducts(message);
      if (products.length > 0) {
        await this.cartService.addItem(userId, products[0].id, 1);
        await this.logAction(session.id, "ADD_TO_CART", { productId: products[0].id });
        aiMessage = `Đã thêm "${products[0].name}" vào giỏ hàng của bạn! Bạn có muốn xem giỏ hàng hay tiếp tục tìm kiếm sản phẩm khác?`;
        recommendedProducts = products.slice(0, 5);
      } else {
        aiMessage = "Xin lỗi, tôi không tìm thấy sản phẩm phù hợp để thêm vào giỏ hàng.";
      }
    }
    // 2. Check for product search
    else if (
      messageLower.includes("váy") ||
      messageLower.includes("áo") ||
      messageLower.includes("quần") ||
      messageLower.includes("đầm") ||
      messageLower.includes("tìm kiếm")
    ) {
      const products = await this.recommendationEngine.searchProducts(message);
      if (products.length > 0) {
        aiMessage = `Tôi tìm thấy ${products.length} sản phẩm phù hợp:\n\n`;
        products.slice(0, 5).forEach((product, index) => {
          const price = product.discountPrice || product.price;
          aiMessage += `${index + 1}. ${product.name}\n`;
          aiMessage += `   Giá: ${price.toLocaleString("vi-VN")}đ\n`;
          aiMessage += `   Tồn kho: ${product.stockQuantity}\n\n`;
        });
        aiMessage += "Bạn muốn thêm sản phẩm nào vào giỏ hàng không?";
        recommendedProducts = products.slice(0, 5);
        await this.logAction(session.id, "SEARCH_PRODUCT", { keyword: message });
      } else {
        aiMessage = "Xin lỗi, tôi không tìm thấy sản phẩm phù hợp.";
      }
    }
    // 3. Check for checkout
    else if (messageLower.includes("thanh toán") || messageLower.includes("checkout")) {
      const cart = await this.cartService.getOrCreateCart(userId);
      if ((cart as any).items && (cart as any).items.length > 0) {
        aiMessage = `Tổng tiền giỏ hàng của bạn là ${cart.totalAmount.toLocaleString("vi-VN")}đ. Vui lòng chọn phương thức thanh toán: ZaloPay, MoMo, VNPay hoặc COD.`;
        nextStep = "CHECKOUT";
        await this.logAction(session.id, "PAYMENT_GUIDE", { cartId: cart.id });
      } else {
        aiMessage = "Giỏ hàng của bạn hiện tại trống. Bạn có thể tìm kiếm sản phẩm rồi thêm vào giỏ hàng nhé!";
      }
    }
    // 4. Default: use LLM
    else {
      aiMessage = await this.llmService.generateResponse(message, conversationId, userId);
    }

    // Save messages if conversation exists
    if (conversationId) {
      await this.messageService.createMessage({
        conversationId,
        senderType: "USER",
        senderId: userId,
        messageContent: message,
        messageType: "TEXT",
      });

      await this.messageService.createMessage({
        conversationId,
        senderType: "AI",
        messageContent: aiMessage,
        messageType: "TEXT",
      });
    }

    return {
      message: aiMessage,
      recommendedProducts,
      cartActions,
      nextStep,
    };
  }

  async getSessionStats(userId?: number) {
    const where = userId ? { userId } : {};

    const totalSessions = await AISalesSession.count({ where });
    const completedSessions = await AISalesSession.count({
      where: { ...where, sessionStatus: "COMPLETED" },
    });

    const totalActions = await AIActionLog.count();

    return {
      totalSessions,
      completedSessions,
      conversionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
      totalActions,
    };
  }
}

export default AISellingService;
