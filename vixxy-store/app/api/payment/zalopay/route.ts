import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, orderInfo } = body;
    
    // Lấy cấu hình từ biến môi trường
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
    
    // --- MÔ PHỎNG GỌI API ZALOPAY ---
    const mockPayUrl = `${BASE_URL}/api/payment/zalopay/simulate-payment?orderId=${orderId}&amount=${amount}`;
    
    return NextResponse.json({
      payUrl: mockPayUrl,
      orderId: orderId
    });
    
  } catch (error) {
    console.error("ZaloPay error:", error);
    return NextResponse.json(
      { message: "Lỗi tạo đơn hàng ZaloPay" },
      { status: 500 }
    );
  }
}
