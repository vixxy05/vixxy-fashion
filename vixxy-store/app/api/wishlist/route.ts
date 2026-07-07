import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/products';
import { Product } from '@/lib/types';

// In-memory storage for demo purposes
const wishlistStorage = new Map<string, string[]>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'guest';

  const wishlistIds = wishlistStorage.get(userId) || [];
  const wishlistProducts = wishlistIds
    .map(id => getProduct(id))
    .filter((product): product is Product => Boolean(product));

  return NextResponse.json(wishlistProducts);
}

export async function POST(request: Request) {
  try {
    const { productId, userId = 'guest' } = await request.json();
    const product = getProduct(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const currentWishlist = wishlistStorage.get(userId) || [];
    if (!currentWishlist.includes(productId)) {
      currentWishlist.push(productId);
      wishlistStorage.set(userId, currentWishlist);
    }

    return NextResponse.json(currentWishlist, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { productId, userId = 'guest' } = await request.json();
    const currentWishlist = wishlistStorage.get(userId) || [];
    const updatedWishlist = currentWishlist.filter(id => id !== productId);
    wishlistStorage.set(userId, updatedWishlist);
    return NextResponse.json(updatedWishlist);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
