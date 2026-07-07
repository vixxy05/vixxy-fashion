import { NextRequest, NextResponse } from "next/server";
import { updateOrder } from "@/lib/orders";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status, transaction_id } = body;
    
    // Lấy secret để xác thực webhook (bảo mật)
    const WEBHOOK_SECRET = process.env.SEPAY_WEBHOOK_SECRET;
    
    // --- MÔ PHỎNG XỬ LÝ WEBHOOK ---
    // Ở đây bạn nên kiểm tra chữ ký (signature) để đảm bảo webhook từ SePay
    // Dùng WEBHOOK_SECRET để xác thực
    
    if (status === "paid" || status === "success") {
      await updateOrder(order_id, {
        paymentStatus: "paid",
        orderStatus: "confirmed"
      });
    }
    
    return NextResponse.json({ message: "success" });
  } catch (error) {
    console.error("SePay webhook error:", error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
