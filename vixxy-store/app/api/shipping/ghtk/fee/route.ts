import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weight } = body;
    
    const baseFee = 15000;
    const fee = baseFee + (Math.ceil((weight || 0.5) * 10000));
    const maxFee = 50000;
    const finalFee = Math.min(fee, maxFee);
    
    return NextResponse.json({
      fee: finalFee,
      expectedDelivery: "2-3 ngày"
    });
  } catch (error) {
    console.error("GHTK Fee API Error:", error);
    return NextResponse.json({ status: 500, message: "Lỗi tính phí" }, { status: 500 });
  }
}
