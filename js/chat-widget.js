(() => {
  const widget = document.getElementById("chatWidget");
  const body = document.getElementById("chatBody");
  const quick = document.getElementById("chatQuick");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const fab = document.getElementById("chatFab");
  const closeBtn = document.getElementById("chatClose");

  if (!widget || !body || !quick || !form || !input) return;

  const nowTime = () =>
    new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const addMsg = (role, text) => {
    const item = document.createElement("div");
    item.className = `chat-msg chat-msg--${role}`;

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = text;

    const meta = document.createElement("div");
    meta.className = "chat-meta";
    meta.textContent = nowTime();

    item.appendChild(bubble);
    item.appendChild(meta);
    body.appendChild(item);
    body.scrollTop = body.scrollHeight;
  };

  const setQuickReplies = (topic) => {
    quick.innerHTML = "";
    const items = [
      topic ? `Tư vấn về: ${topic}` : "Tư vấn sản phẩm",
      "Hướng dẫn chọn size",
      "Chính sách đổi hàng",
      "Phí & thời gian vận chuyển",
      "Thanh toán",
    ];
    items.forEach((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chat-quick-btn";
      b.textContent = t;
      b.addEventListener("click", () => {
        addMsg("me", t);
        botReply(t);
      });
      quick.appendChild(b);
    });
  };

  const botReply = (text) => {
    const t = text.toLowerCase();

    let reply =
      "Mình đã nhận được. Bạn cần hỗ trợ thêm về sản phẩm, size, vận chuyển hay thanh toán?";

    if (t.includes("size") || t.includes("kích cỡ") || t.includes("kích thước")) {
      reply =
        "Về size: bạn cho mình chiều cao/cân nặng + số đo (ngực/eo/mông) hoặc size thường mặc (XS–L) để mình gợi ý nhanh nhé.";
    } else if (t.includes("đổi") || t.includes("trả") || t.includes("hoàn")) {
      reply =
        "Đổi hàng: trong 7 ngày, sản phẩm còn tag và chưa qua sử dụng. Bạn gửi mã đơn + lý do đổi để mình hỗ trợ.";
    } else if (t.includes("vận chuyển") || t.includes("ship") || t.includes("giao")) {
      reply =
        "Vận chuyển: nội thành 1–2 ngày, tỉnh 2–4 ngày (tuỳ khu vực). Bạn cho mình địa chỉ (quận/tỉnh) để mình báo chính xác hơn.";
    } else if (t.includes("thanh toán") || t.includes("payment") || t.includes("chuyển khoản")) {
      reply =
        "Thanh toán: COD, chuyển khoản, thẻ (VISA/MC/JCB). Bạn muốn dùng phương thức nào để mình hướng dẫn từng bước?";
    } else if (t.includes("thân thiết") || t.includes("khách hàng")) {
      reply =
        "Thành viên thân thiết: tích điểm theo giá trị đơn hàng và nhận ưu đãi theo hạng. Bạn cho mình email/sđt để mình tra cứu hạng nhé.";
    } else if (t.includes("hỏi đáp") || t.includes("faq")) {
      reply =
        "Bạn muốn hỏi về: size, chất liệu, thời gian giao, đổi trả hay thanh toán? Mình trả lời nhanh theo từng mục.";
    }

    // hiệu ứng typing nhẹ
    const typing = document.createElement("div");
    typing.className = "chat-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;

    setTimeout(() => {
      typing.remove();
      addMsg("bot", reply);
    }, 550);
  };

  const openChat = (topic) => {
    widget.classList.add("is-open");
    widget.setAttribute("aria-hidden", "false");
    if (fab) fab.classList.add("is-hidden");

    if (!body.dataset.inited) {
      body.dataset.inited = "1";
      addMsg("bot", "Xin chào! Mình là VIXXY Support — mình có thể giúp gì cho bạn?");
      setQuickReplies(topic);
    } else {
      setQuickReplies(topic);
    }

    if (topic) {
      addMsg("me", topic);
      botReply(topic);
    }

    input.focus();
  };

  const closeChat = () => {
    widget.classList.remove("is-open");
    widget.setAttribute("aria-hidden", "true");
    if (fab) fab.classList.remove("is-hidden");
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = String(input.value || "").trim();
    if (!v) return;
    input.value = "";
    addMsg("me", v);
    botReply(v);
  });

  if (fab) fab.addEventListener("click", () => openChat(""));
  if (closeBtn) closeBtn.addEventListener("click", closeChat);

  document.querySelectorAll(".support-chat-link").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const topic = a.getAttribute("data-topic") || a.textContent || "";
      openChat(topic.trim());
    });
  });

  // ESC to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && widget.classList.contains("is-open")) closeChat();
  });
})();

