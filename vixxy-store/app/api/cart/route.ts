import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/products';
import { CartItem } from '@/lib/types';

// In-memory storage for demo purposes
const cartStorage = new Map<string, CartItem[]>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'guest';

  const cart = cartStorage.get(userId) || [];
  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  try {
    const { productId, size, userId = 'guest' } = await request.json();
    const product = getProduct(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const currentCart = cartStorage.get(userId) || [];
    const existingItemIndex = currentCart.findIndex(
      item => item.product.id === productId && item.size === size
    );

    if (existingItemIndex !== -1) {
      currentCart[existingItemIndex].quantity += 1;
    } else {
      currentCart.push({ product, quantity: 1, size });
    }

    cartStorage.set(userId, currentCart);
    return NextResponse.json(currentCart, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { productId, size, quantity, userId = 'guest' } = await request.json();
    const currentCart = cartStorage.get(userId) || [];
    const itemIndex = currentCart.findIndex(
      item => item.product.id === productId && item.size === size
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      currentCart.splice(itemIndex, 1);
    } else {
      currentCart[itemIndex].quantity = quantity;
    }

    cartStorage.set(userId, currentCart);
    return NextResponse.json(currentCart);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { productId, size, userId = 'guest', clearAll = false } = await request.json();
    const currentCart = cartStorage.get(userId) || [];

    if (clearAll) {
      cartStorage.set(userId, []);
      return NextResponse.json([]);
    }

    const updatedCart = currentCart.filter(
      item => !(item.product.id === productId && item.size === size)
    );

    cartStorage.set(userId, updatedCart);
    return NextResponse.json(updatedCart);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
