import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';

export const cartRouter = Router();

// Centralized pricing logic (Sections 23, 24, 25)
function calculateCartTotals(items: Array<{ type: string; price: number; quantity: number }>) {
  // Standard prints (₹40 items qualify for 3 for ₹100)
  const standardPrintCount = items
    .filter((i: { type: string; price: number; quantity: number }) =>
      i.type === 'archive' || i.type === 'category' || (i.price === 40 && i.type !== 'custom'))
    .reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0);

  const bundleCount = Math.floor(standardPrintCount / 3);
  const bundleDiscount = bundleCount * 20; // Save ₹20 per bundle

  const rawSubtotal = items.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);
  const subtotal = Math.max(0, rawSubtotal - bundleDiscount);
  const shipping = subtotal >= 200 || subtotal === 0 ? 0 : 40;
  const total = subtotal + shipping;

  const remainderStandard = standardPrintCount % 3;
  const isOneMoreForBundle = remainderStandard === 2;

  return {
    rawSubtotal,
    bundleDiscount,
    subtotal,
    shipping,
    total,
    standardPrintCount,
    isOneMoreForBundle,
  };
}

/**
 * GET /api/cart
 * Returns persistent cart with server-calculated totals
 */
cartRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                image: true,
                style: true,
                stockQuantity: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    const formattedItems = cart.items.map((item: {
      id: string;
      productId: string | null;
      type: string;
      quantity: number;
      title: string;
      imageUrl: string;
      caption: string | null;
      filterName: string | null;
      frameStyle: string | null;
      textColor: string | null;
      dateStamp: boolean;
      product?: { price: number; stockQuantity: number } | null;
    }) => {
      const price = item.product ? item.product.price : (item.type === 'custom' ? 50 : 40);
      return {
        id: item.id,
        productId: item.productId,
        type: item.type,
        quantity: item.quantity,
        title: item.title,
        price,
        imageUrl: item.imageUrl,
        caption: item.caption,
        filterName: item.filterName,
        frameStyle: item.frameStyle,
        textColor: item.textColor,
        dateStamp: item.dateStamp,
        stockAvailable: item.product ? item.product.stockQuantity : 999,
      };
    });

    const totals = calculateCartTotals(formattedItems);

    return res.json({
      success: true,
      cartId: cart.id,
      items: formattedItems,
      ...totals,
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve darkroom cart.',
    });
  }
});

/**
 * POST /api/cart/items
 * Add item to cart with server-side product verification
 */
cartRouter.post('/items', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      productId,
      type = 'archive',
      quantity = 1,
      title,
      imageUrl,
      caption,
      filterName,
      frameStyle,
      textColor,
      dateStamp,
    } = req.body;

    const safeQty = Math.max(1, parseInt(quantity) || 1);

    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    let finalTitle = title;
    let finalImageUrl = imageUrl;
    let finalPrice = 40;

    // If productId is provided, verify against DB!
    if (productId) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!dbProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in darkroom archive.',
        });
      }

      finalTitle = dbProduct.title;
      finalImageUrl = dbProduct.image;
      finalPrice = dbProduct.price;

      // Check if item with this product already exists in cart
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: dbProduct.id,
        },
      });

      if (existingItem) {
        const updated = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + safeQty,
          },
        });

        return res.json({
          success: true,
          message: 'Cart quantity updated.',
          item: updated,
        });
      }
    } else if (type === 'custom') {
      finalPrice = 50;
    }

    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: productId || null,
        type,
        quantity: safeQty,
        title: finalTitle || 'Custom Print',
        imageUrl: finalImageUrl || '',
        caption: caption || '',
        filterName: filterName || 'Classic',
        frameStyle: frameStyle || 'Classic',
        textColor: textColor || '#E8DDC8',
        dateStamp: dateStamp ?? true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Item added to darkroom cart.',
      item: newItem,
    });
  } catch (error) {
    console.error('Add cart item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add item to darkroom cart.',
    });
  }
});

/**
 * PATCH /api/cart/items/:id
 * Update item quantity
 */
cartRouter.patch('/items/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user!.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const item = await prisma.cartItem.findFirst({
      where: { id, cartId: cart.id },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const newQty = parseInt(quantity);

    if (newQty <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
      return res.json({ success: true, message: 'Item removed from cart.' });
    }

    const updated = await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: newQty },
    });

    return res.json({ success: true, item: updated });
  } catch (error) {
    console.error('Update cart item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update cart quantity.',
    });
  }
});

/**
 * DELETE /api/cart/items/:id
 * Remove single item from cart
 */
cartRouter.delete('/items/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    await prisma.cartItem.deleteMany({
      where: { id, cartId: cart.id },
    });

    return res.json({ success: true, message: 'Item removed.' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart.',
    });
  }
});

/**
 * DELETE /api/cart
 * Clear entire cart
 */
cartRouter.delete('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return res.json({ success: true, message: 'Darkroom cart emptied.' });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to empty cart.',
    });
  }
});
