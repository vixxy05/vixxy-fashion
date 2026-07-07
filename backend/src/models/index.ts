
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

const initAssociations = () => {
  Permission.associate();
  Role.associate();
  User.associate();
  RefreshToken.associate();
  ResetToken.associate();
  LoginHistory.associate();
  AuditLog.associate();
  PaymentGateway.associate();
  Order.associate();
  OrderDetail.associate();
  Payment.associate();
  PaymentLog.associate();
  Shipping.associate();
  Conversation.associate();
  Message.associate();
  MessageAttachment.associate();
  ConversationSummary.associate();
  ConversationTag.associate();
  ConversationArchive.associate();
  AIUsageLog.associate();
  AIKnowledge.associate();
  AIEmbedding.associate();
  AIKnowledgeSearchLog.associate();
  ChatSession.associate();
  ChatMessage.associate();
  ChatTransfer.associate();
  ChatQueue.associate();
  ChatAttachment.associate();
  Cart.associate();
  CartItem.associate();
  AISalesSession.associate();
  AIRecommendationLog.associate();
  AIActionLog.associate();
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
};

export default db;
export { initAssociations };
