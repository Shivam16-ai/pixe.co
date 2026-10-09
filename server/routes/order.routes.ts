import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { emitOrderCreated, emitInventoryUpdated, emitInventoryLow, emitInventoryOut, getSocketServer } from '../socket';

export const orderRouter = Router();

// Order statuses timeline order
const TIMELINE_STAGES = [
  'QUEUED',
  'EMULSION_PREP',
  'OPTICAL_EXPOSURE',
  'CRYSTALLIZATION',
  'WAX_PACKAGING',
  'DISPATCHED',
  'DELIVERED',
];

/**
 * POST /api/orders
 * Real checkout flow with server-side validation and stock reduction (Sections 26, 27, 28, 33)
 */
orderRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { shippingAddress, paymentMethod = 'upi' } = req.body;

    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required.',
      });
    }

    // 1. Load user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your darkroom cart is empty.',
      });
    }

    // 2. Verify stock & prices
    for (const item of cart.items) {
      if (item.productId && item.product) {
        if (item.product.stockQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Product "${item.product.title}" has insufficient darkroom stock (${item.product.stockQuantity} remaining).`,
          });
        }
      }
    }

    // 3. Calculate server-side totals
    const standardPrintCount = cart.items
      .filter((i: { type: string; product?: { price: number } | null; quantity: number }) =>
        i.type === 'archive' || i.type === 'category' || (i.product && i.product.price === 40))
      .reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0);

    const bundleCount = Math.floor(standardPrintCount / 3);
    const bundleDiscount = bundleCount * 20;

    const rawSubtotal = cart.items.reduce((sum: number, item: { product?: { price: number } | null; type: string; quantity: number }) => {
      const price = item.product ? item.product.price : (item.type === 'custom' ? 50 : 40);
      return sum + price * item.quantity;
    }, 0);

    const subtotal = Math.max(0, rawSubtotal - bundleDiscount);
    const shipping = subtotal >= 200 || subtotal === 0 ? 0 : 40;
    const total = subtotal + shipping;

    // 4. Generate order number
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `PX-${datePrefix}-${randomSuffix}`;
    const trackingId = `IND-EMU-${Math.floor(100000 + Math.random() * 900000)}`;

    // 5. Execute transaction: create order, create order items, decrement stock, clear cart
    const order = await prisma.$transaction(async (tx) => {
      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'QUEUED',
          subtotal,
          shipping,
          total,
          trackingId,
          shippingAddress: JSON.stringify(shippingAddress),
          paymentMethod,
        },
      });

      // Create OrderItems with frozen snapshots
      for (const item of cart.items) {
        const unitPrice = item.product ? item.product.price : (item.type === 'custom' ? 50 : 40);
        const itemSubtotal = unitPrice * item.quantity;

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            productTitleSnapshot: item.title,
            productImageSnapshot: item.imageUrl,
            quantity: item.quantity,
            unitPrice,
            subtotal: itemSubtotal,
            caption: item.caption,
            frameStyle: item.frameStyle || 'Classic',
            filterName: item.filterName || 'Classic',
          },
        });

        // Decrement product stock if applicable
        if (item.productId && item.product) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });

    const io = getSocketServer();
    if (io && fullOrder) {
      const orderPayload = {
        orderId: fullOrder.id,
        orderNumber: fullOrder.orderNumber,
        customerId: userId,
        customerName: req.user?.name || 'Collector',
        total: Number(fullOrder.total || 0),
        status: fullOrder.status,
        createdAt: fullOrder.createdAt.toISOString(),
      };

      emitOrderCreated(io, orderPayload);

      for (const item of cart.items) {
        if (!item.productId || !item.product) {
          continue;
        }

        const updatedProduct = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, title: true, stockQuantity: true },
        });

        if (updatedProduct) {
          const payload = {
            productId: updatedProduct.id,
            productName: updatedProduct.title,
            stockQuantity: updatedProduct.stockQuantity,
            updatedAt: new Date().toISOString(),
          };

          emitInventoryUpdated(io, payload);

          if (updatedProduct.stockQuantity <= 5) {
            emitInventoryLow(io, {
              ...payload,
              productName: updatedProduct.title,
              remaining: updatedProduct.stockQuantity,
            });
          }

          if (updatedProduct.stockQuantity === 0) {
            emitInventoryOut(io, {
              ...payload,
              productName: updatedProduct.title,
              remaining: 0,
            });
          }
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Darkroom order queued for physical emulsion exposure.',
      order: fullOrder,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process order.',
    });
  }
});

/**
 * GET /api/orders
 * Returns customer's own orders (Section 29)
 */
orderRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders.',
    });
  }
});

/**
 * GET /api/orders/:id
 * Returns single order details
 */
orderRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!isAdmin && order.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    console.error('Order detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order.',
    });
  }
});

/**
 * GET /api/orders/:id/tracking
 * Real timeline tracking endpoint (Section 30)
 */
orderRouter.get('/:id/tracking', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!isAdmin && order.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const currentStageIndex = TIMELINE_STAGES.indexOf(order.status);

    const timeline = [
      {
        stage: 'Queued',
        statusKey: 'QUEUED',
        completed: currentStageIndex >= 0,
        current: order.status === 'QUEUED',
        description: 'Order registered in darkroom spooler with emulsion calibration parameters.',
      },
      {
        stage: 'Emulsion Prep',
        statusKey: 'EMULSION_PREP',
        completed: currentStageIndex >= 1,
        current: order.status === 'EMULSION_PREP',
        description: '35mm optical chemical bath heating to 38.5°C in light-tight tank.',
      },
      {
        stage: 'Optical Exposure',
        statusKey: 'OPTICAL_EXPOSURE',
        completed: currentStageIndex >= 2,
        current: order.status === 'OPTICAL_EXPOSURE',
        description: 'High-precision laser exposure onto physical gelatin silver emulsion.',
      },
      {
        stage: 'Crystallization',
        statusKey: 'CRYSTALLIZATION',
        completed: currentStageIndex >= 3,
        current: order.status === 'CRYSTALLIZATION',
        description: 'Color dye diffusion transfer and chemical development in progress.',
      },
      {
        stage: 'Wax Packaging',
        statusKey: 'WAX_PACKAGING',
        completed: currentStageIndex >= 4,
        current: order.status === 'WAX_PACKAGING',
        description: 'Inspected under safelight and sealed with PIXÉ archival wax emblem.',
      },
      {
        stage: 'Dispatched',
        statusKey: 'DISPATCHED',
        completed: currentStageIndex >= 5,
        current: order.status === 'DISPATCHED',
        description: 'Handed to express logistics partner with climate-controlled pouch.',
      },
      {
        stage: 'Delivered',
        statusKey: 'DELIVERED',
        completed: currentStageIndex >= 6,
        current: order.status === 'DELIVERED',
        description: 'Arrived at collector gallery desk.',
      },
    ];

    return res.json({
      success: true,
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      trackingId: order.trackingId,
      timeline,
    });
  } catch (error) {
    console.error('Tracking fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve tracking details.',
    });
  }
});
