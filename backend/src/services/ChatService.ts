
import db from "../models";
import LLMService from "./LLMService";
import ConversationService from "./ConversationService";
import MessageService from "./MessageService";

const { Conversation, Message } = db;

export class ChatService {
  private llmService: LLMService;
  private conversationService: ConversationService;
  private messageService: MessageService;

  constructor() {
    this.llmService = new LLMService();
    this.conversationService = new ConversationService();
    this.messageService = new MessageService();
  }

  async sendMessage(conversationId: number, message: string, userId?: number) {
    // 1. Save user message
    const userMessage = await this.messageService.createMessage({
      conversationId,
      senderType: 'USER',
      senderId: userId,
      messageContent: message,
      messageType: 'TEXT',
    });

    // 2. Generate AI response with RAG
    const aiResponse = await this.llmService.generateResponse(message, conversationId, userId);

    // 3. Save AI message
    const aiMessage = await this.messageService.createMessage({
      conversationId,
      senderType: 'AI',
      messageContent: aiResponse,
      messageType: 'TEXT',
    });

    return {
      success: true,
      message: aiMessage,
    };
  }
}

export default ChatService;
