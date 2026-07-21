import { collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { db, hasFirebaseConfig } from "@/lib/firebase";

export interface LiveChatMessage {
  id: string;
  userEmail: string;
  userName: string;
  sender: "user" | "admin" | "bot";
  text: string;
  timestamp: string;
}

export const CHAT_STORAGE_KEY = "vixxy_live_chats_v4";
export const CHAT_EVENT_NAME = "vixxy-chat-updated";

/**
 * localStorage chỉ đóng vai trò cache để vẽ ngay khi F5 và fallback khi offline.
 * Nguồn sự thật là Firestore collection `chats`.
 */
function readCache(): LiveChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCache(messages: LiveChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch {}
}

function sortByTime(messages: LiveChatMessage[]) {
  return [...messages].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/** Gộp danh sách mới vào cũ, khử trùng lặp theo id. */
function merge(base: LiveChatMessage[], incoming: LiveChatMessage[]) {
  const byId = new Map(base.map((m) => [m.id, m]));
  incoming.forEach((m) => byId.set(m.id, m));
  return sortByTime(Array.from(byId.values()));
}

export function getChatList(): LiveChatMessage[] {
  return sortByTime(readCache());
}

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    broadcastChannel = new BroadcastChannel("vixxy_chat_channel");
  } catch {}
}

/**
 * Lắng nghe realtime. Callback nhận nguyên danh sách tin nhắn đã sắp xếp.
 * Gọi callback ngay 1 lần với cache để UI không bị trống lúc chờ Firestore.
 */
export function subscribeChatUpdates(callback: (messages: LiveChatMessage[]) => void) {
  if (typeof window === "undefined") return () => {};

  callback(getChatList());

  const emitFromCache = () => callback(getChatList());

  const handleStorage = (e: StorageEvent) => {
    if (e.key === CHAT_STORAGE_KEY) emitFromCache();
  };

  window.addEventListener(CHAT_EVENT_NAME, emitFromCache);
  window.addEventListener("storage", handleStorage);
  broadcastChannel?.addEventListener("message", emitFromCache);

  let unsubscribeFirebase: (() => void) | null = null;
  if (hasFirebaseConfig() && db) {
    try {
      const q = query(collection(db, "chats"), orderBy("timestamp", "asc"));
      unsubscribeFirebase = onSnapshot(
        q,
        (snapshot) => {
          const remote = snapshot.docs.map((d) => d.data() as LiveChatMessage);
          // Firestore là nguồn sự thật; ghi đè cache kể cả khi rỗng.
          writeCache(remote);
          callback(sortByTime(remote));
        },
        (error) => {
          if (error?.code === "permission-denied") {
            console.error(
              "[chat] Firestore từ chối đọc collection `chats`. Kiểm tra đã publish " +
                "vixxy-store/firestore.rules chưa."
            );
          } else {
            console.warn("[chat] Firestore listener error, dùng cache local:", error?.message || error);
          }
        }
      );
    } catch (err) {
      console.warn("[chat] Không khởi tạo được Firestore listener:", err);
    }
  }

  return () => {
    window.removeEventListener(CHAT_EVENT_NAME, emitFromCache);
    window.removeEventListener("storage", handleStorage);
    broadcastChannel?.removeEventListener("message", emitFromCache);
    unsubscribeFirebase?.();
  };
}

/**
 * Gửi 1 tin nhắn. Cập nhật cache ngay (optimistic) rồi ghi đúng 1 document lên
 * Firestore — onSnapshot ở mọi tab/máy khác sẽ nhận được trong ~100ms.
 */
export function sendMessage(input: {
  userEmail: string;
  userName: string;
  sender: "user" | "admin" | "bot";
  text: string;
}): LiveChatMessage | null {
  const text = input.text.trim();
  if (!text) return null;

  const message: LiveChatMessage = {
    id: `msg_${input.sender}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userEmail: input.userEmail,
    userName: input.userName,
    sender: input.sender,
    text,
    timestamp: new Date().toISOString(),
  };

  writeCache(merge(readCache(), [message]));
  window.dispatchEvent(new CustomEvent(CHAT_EVENT_NAME));
  broadcastChannel?.postMessage({ type: CHAT_EVENT_NAME });

  if (hasFirebaseConfig() && db) {
    setDoc(doc(db, "chats", message.id), message).catch((e) => {
      if (e?.code === "permission-denied") {
        console.error(
          "[chat] Firestore từ chối ghi tin nhắn — tin nhắn sẽ không đến được phía bên kia. " +
            "Kiểm tra firestore.rules."
        );
      } else {
        console.error("[chat] Lỗi ghi tin nhắn:", e);
      }
    });
  }

  return message;
}

export const chatService = {
  getChatList,
  subscribeChatUpdates,
  sendMessage,
  CHAT_STORAGE_KEY,
  CHAT_EVENT_NAME,
};

export default chatService;