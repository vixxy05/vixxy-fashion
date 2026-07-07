import { NextResponse } from 'next/server';
import { products } from '@/lib/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let filteredProducts = products;

  if (category) {
    filteredProducts = products.filter(p => p.category === category);
  }

  return NextResponse.json(filteredProducts);
}
