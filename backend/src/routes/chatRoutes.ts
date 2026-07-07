
import express from "express";
import ChatController from "../controllers/ChatController";

const router = express.Router();

// Conversation routes
router.post("/conversations", ChatController.createConversation);
router.get("/conversations/:id", ChatController.getConversation);
router.delete("/conversations/:id", ChatController.deleteConversation);
router.post("/conversations/:id/close", ChatController.closeConversation);
router.post("/conversations/:id/archive", ChatController.archiveConversation);

// Message routes
router.post("/messages", ChatController.sendMessage);
router.get("/messages/:conversationId", ChatController.getMessageHistory);

// Summary routes
router.post("/conversations/:id/summary", ChatController.generateSummary);
router.get("/conversations/:id/summaries", ChatController.getConversationSummaries);

// Search routes
router.post("/messages/search", ChatController.searchMessages);
router.post("/conversations/search", ChatController.searchConversations);

// Export routes
router.get("/conversations/:id/export", ChatController.exportConversation);

// Tags routes
router.post("/conversations/:id/tags", ChatController.addTagToConversation);
router.delete("/conversations/:id/tags", ChatController.removeTagFromConversation);
router.get("/tags", ChatController.getAllTags);

// History and dashboard
router.get("/history", ChatController.getChatHistory);
router.get("/dashboard/stats", ChatController.getDashboardStats);

// Knowledge base
router.get("/faqs", ChatController.getFAQs);
router.post("/faqs", ChatController.addFAQ);

export default router;
