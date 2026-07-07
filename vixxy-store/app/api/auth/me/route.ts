import { NextResponse } from 'next/server';

export async function GET() {
  // Trong thực tế, bạn sẽ lấy thông tin từ session hoặc token
  // Ở đây chúng ta trả về dữ liệu demo hoặc thông tin từ localStorage phía client
  return NextResponse.json({
    message: 'This endpoint is protected. Please implement session-based authentication.',
  });
}
