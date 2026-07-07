import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const trackingCode = searchParams.get("trackingCode");
    
    const now = new Date();
    const steps = [
      {
        status: "Đang chuẩn bị hàng",
        time: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
        location: "Kho hàng VIXXY D'ORANCE - TP. Hồ Chí Minh"
      },
      {
        status: "Đã lấy hàng",
        time: new Date(now.getTime() - 1000 * 60 * 60 * 20).toISOString(),
        location: "Kho hàng VIXXY D'ORANCE - TP. Hồ Chí Minh"
      },
      {
        status: "Đang vận chuyển",
        time: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(),
        location: "Trung tâm phân phối GHTK - Bình Dương"
      },
      {
        status: "Đang giao hàng",
        time: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
        location: "Nhân viên giao hàng đang trên đường"
      },
      {
        status: "Đã giao hàng",
        time: now.toISOString(),
        location: "Đã giao đến tay người nhận"
      }
    ];
    
    return NextResponse.json({
      trackingCode,
      status: "success",
      steps
    });
  } catch (error) {
    console.error("GHTK Tracking API Error:", error);
    return NextResponse.json({ status: 500, message: "Lỗi tracking" }, { status: 500 });
  }
}
