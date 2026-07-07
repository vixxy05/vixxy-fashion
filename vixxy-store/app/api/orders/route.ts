import { NextRequest, NextResponse } from "next/server";
import { getOrdersByUserId, createOrder, updateOrder } from "@/lib/orders";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ message: "Thiếu userId" }, { status: 400 });
    }
    
    const orders = getOrdersByUserId(userId);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders GET Error:", error);
    return NextResponse.json({ message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.userId || !body.items || !body.shippingInfo || !body.paymentMethod) {
      return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
    }
    
    const order = createOrder(body);
    
    setTimeout(() => {
      updateOrder(order.id, { 
        orderStatus: "confirmed", 
        paymentStatus: body.paymentMethod === "cod" ? "pending" : "paid" 
      });
    }, 2000);
    
    setTimeout(() => {
      updateOrder(order.id, { 
        orderStatus: "shipping", 
        trackingCode: `GHTK${Date.now().toString().slice(-8)}`, 
        shippingPartner: "GHTK" 
      });
    }, 5000);
    
    setTimeout(() => {
      updateOrder(order.id, { 
        orderStatus: "delivered", 
        paymentStatus: "paid" 
      });
    }, 10000);
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Orders POST Error:", error);
    return NextResponse.json({ message: "Lỗi tạo đơn hàng" }, { status: 500 });
  }
}
