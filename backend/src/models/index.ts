
import sequelize from "../config/database";
import Role from "./Role";
import User from "./User";
import Product from "./Product";
import Order from "./Order";
import OrderDetail from "./OrderDetail";
import PaymentGateway from "./PaymentGateway";
import Payment from "./Payment";
import PaymentLog from "./PaymentLog";
import Shipping from "./Shipping";
import Conversation from "./Conversation";
import Message from "./Message";
import ChatbotKnowledge from "./ChatbotKnowledge";
import ChatbotPrompt from "./ChatbotPrompt";
import AIUsageLog from "./AIUsageLog";
import AIKnowledgeCategory from "./AIKnowledgeCategory";
import AIKnowledge from "./AIKnowledge";
import AIEmbedding from "./AIEmbedding";
import AIKnowledgeSearchLog from "./AIKnowledgeSearchLog";
import ChatSession from "./ChatSession";
import ChatMessage from "./ChatMessage";
import ChatTransfer from "./ChatTransfer";
import ChatQueue from "./ChatQueue";
import ChatAttachment from "./ChatAttachment";
import MessageAttachment from "./MessageAttachment";
import ConversationSummary from "./ConversationSummary";
import ConversationTag from "./ConversationTag";
import ConversationArchive from "./ConversationArchive";
import Cart from "./Cart";
import CartItem from "./CartItem";
import AISalesSession from "./AISalesSession";
import AIRecommendationLog from "./AIRecommendationLog";
import AIActionLog from "./AIActionLog";
import Permission from "./Permission";
import RefreshToken from "./RefreshToken";
import ResetToken from "./ResetToken";
import LoginHistory from "./LoginHistory";
import AuditLog from "./AuditLog";
import RefundRequest from "./RefundRequest";
import Banner from "./Banner";
import Voucher from "./Voucher";
import OrderVoucher from "./OrderVoucher";
import InventoryReservation from "./InventoryReservation";

const initAssociations = () => {
  Permission.associate(db);
  Role.associate(db);
  User.associate(db);
  RefreshToken.associate(db);
  ResetToken.associate(db);
  LoginHistory.associate(db);
  AuditLog.associate(db);
  PaymentGateway.associate(db);
  Order.associate(db);
  OrderDetail.associate(db);
  Payment.associate(db);
  PaymentLog.associate(db);
  Shipping.associate(db);
  Conversation.associate(db);
  Message.associate(db);
  MessageAttachment.associate(db);
  ConversationSummary.associate(db);
  ConversationTag.associate(db);
  ConversationArchive.associate(db);
  AIUsageLog.associate(db);
  AIKnowledge.associate(db);
  AIEmbedding.associate(db);
  AIKnowledgeSearchLog.associate(db);
  ChatSession.associate(db);
  ChatMessage.associate(db);
  ChatTransfer.associate(db);
  ChatQueue.associate(db);
  ChatAttachment.associate(db);
  Cart.associate(db);
  CartItem.associate(db);
  AISalesSession.associate(db);
  AIRecommendationLog.associate(db);
  AIActionLog.associate(db);
  RefundRequest.associate(db);
  OrderVoucher.associate(db);
  InventoryReservation.associate(db);
};

const db = {
  sequelize,
  Role,
  User,
  Product,
  Order,
  OrderDetail,
  PaymentGateway,
  Payment,
  PaymentLog,
  Shipping,
  Conversation,
  Message,
  ChatbotKnowledge,
  ChatbotPrompt,
  AIUsageLog,
  AIKnowledgeCategory,
  AIKnowledge,
  AIEmbedding,
  AIKnowledgeSearchLog,
  ChatSession,
  ChatMessage,
  ChatTransfer,
  ChatQueue,
  ChatAttachment,
  MessageAttachment,
  ConversationSummary,
  ConversationTag,
  ConversationArchive,
  Cart,
  CartItem,
  AISalesSession,
  AIRecommendationLog,
  AIActionLog,
  Permission,
  RefreshToken,
  ResetToken,
  LoginHistory,
  AuditLog,
  RefundRequest,
  Banner,
  Voucher,
  OrderVoucher,
  InventoryReservation,
};

export default db;
export { initAssociations };
