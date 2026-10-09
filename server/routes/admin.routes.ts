import { Router, Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest, requireAdmin } from '../middleware/auth';
import { emitInventoryLow, emitInventoryOut, emitInventoryUpdated, emitOrderStatusUpdated, emitProductUpdated, getSocketServer } from '../socket';

export const adminRouter = Router();

// Ensure all routes require darkroom admin role (Section 10)
adminRouter.use(requireAdmin);

const VALID_STATUS_SEQUENCE = [
  'QUEUED',
  'EMULSION_PREP',
  'OPTICAL_EXPOSURE',
  'CRYSTALLIZATION',
  'WAX_PACKAGING',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED',
];

/**
 * GET /api/admin/orders
 * All orders across the darkroom
 */
adminRouter.get('/orders', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
});

/**
 * GET /api/admin/orders/:id
 */
adminRouter.get('/orders/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    console.error('Admin order fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order.' });
  }
});

/**
 * PATCH /api/admin/orders/:id/status
 * Advance order status through strict allowed states (Section 31)
 */
adminRouter.patch('/orders/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUS_SEQUENCE.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed values: ${VALID_STATUS_SEQUENCE.join(', ')}`,
      });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true, user: true },
    });

    const io = getSocketServer();
    if (io) {
      emitOrderStatusUpdated(io, {
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        customerId: updated.userId,
        status: updated.status,
        updatedAt: updated.updatedAt.toISOString(),
      });
    }

    return res.json({
      success: true,
      message: `Order status advanced to ${status}`,
      order: updated,
    });
  } catch (error) {
    console.error('Order status update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

/**
 * POST /api/admin/products
 * Create product in database (Section 32)
 */
adminRouter.post('/products', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.id || !data.title || !data.category || !data.image) {
      return res.status(400).json({
        success: false,
        message: 'Product id, title, category, and image are required.',
      });
    }

    const existing = await prisma.product.findUnique({ where: { id: data.id } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Product with ID "${data.id}" already exists.`,
      });
    }

    const product = await prisma.product.create({
      data: {
        id: data.id,
        title: data.title,
        subject: data.subject || data.characterOrSubject || data.title,
        category: data.category,
        subcategory: data.subcategory || null,
        franchise: data.franchise || null,
        description: data.description || `${data.title} archival proof.`,
        image: data.image,
        thumbnail: data.thumbnail || data.image,
        price: data.price ? parseInt(data.price) : 40,
        style: data.style || 'Classic',
        stockQuantity: data.stockQuantity ? parseInt(data.stockQuantity) : 100,
        featured: Boolean(data.featured),
        popular: Boolean(data.popular),
        trending: Boolean(data.trending),
        tags: JSON.stringify(data.tags || [data.category]),
        aliases: data.aliases ? JSON.stringify(data.aliases) : null,
        arcs: data.arcs ? JSON.stringify(data.arcs) : null,
        role: data.role || null,
        crewOrAffiliation: data.crewOrAffiliation || null,
        caption: data.caption || null,
        dateStr: data.dateStr || '10.06.26',
        rotation: data.rotation ? parseFloat(data.rotation) : 0,
        tapeColor: data.tapeColor || 'yellow',
        imageStatus: data.imageStatus || 'VERIFIED',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Product registered in darkroom archive.',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
});

/**
 * PATCH /api/admin/products/:id
 * Edit product, price, stock, images (Section 32)
 */
adminRouter.patch('/products/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.subcategory !== undefined) updateData.subcategory = data.subcategory;
    if (data.franchise !== undefined) updateData.franchise = data.franchise;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.price !== undefined) updateData.price = Math.max(0, parseInt(data.price));
    if (data.stockQuantity !== undefined) updateData.stockQuantity = Math.max(0, parseInt(data.stockQuantity));
    if (data.style !== undefined) updateData.style = data.style;
    if (data.featured !== undefined) updateData.featured = Boolean(data.featured);
    if (data.popular !== undefined) updateData.popular = Boolean(data.popular);
    if (data.trending !== undefined) updateData.trending = Boolean(data.trending);
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.imageStatus !== undefined) updateData.imageStatus = data.imageStatus;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    const io = getSocketServer();
    if (io) {
      const inventoryPayload = {
        productId: updated.id,
        stockQuantity: updated.stockQuantity,
        updatedAt: updated.updatedAt.toISOString(),
      };

      emitInventoryUpdated(io, inventoryPayload);

      if (updated.stockQuantity <= 5) {
        emitInventoryLow(io, {
          ...inventoryPayload,
          productName: updated.title,
          remaining: updated.stockQuantity,
        });
      }

      if (updated.stockQuantity === 0) {
        emitInventoryOut(io, {
          ...inventoryPayload,
          productName: updated.title,
          remaining: 0,
        });
      }

      emitProductUpdated(io, {
        productId: updated.id,
        title: updated.title,
        price: updated.price,
        stockQuantity: updated.stockQuantity,
        updatedAt: updated.updatedAt.toISOString(),
        image: updated.image,
      });
    }

    return res.json({
      success: true,
      message: 'Product updated.',
      product: updated,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

/**
 * DELETE /api/admin/products/:id
 */
adminRouter.delete('/products/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({ where: { id } });
    return res.json({ success: true, message: 'Product removed from darkroom catalog.' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

/**
 * GET /api/admin/analytics
 * Real database analytics (Sections 38, 39)
 */
adminRouter.get('/analytics', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalOrders,
      orders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({ select: { total: true, status: true, createdAt: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.product.findMany({
        where: { stockQuantity: { lte: 20 } },
        select: { id: true, title: true, stockQuantity: true, category: true },
        take: 10,
      }),
    ]);

    const totalRevenue = orders.reduce((sum: number, o: { total: number }) => sum + o.total, 0);

    const statusCounts: Record<string, number> = {};
    for (const o of orders) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }

    const pendingOrders =
      (statusCounts['QUEUED'] || 0) +
      (statusCounts['EMULSION_PREP'] || 0) +
      (statusCounts['OPTICAL_EXPOSURE'] || 0) +
      (statusCounts['CRYSTALLIZATION'] || 0) +
      (statusCounts['WAX_PACKAGING'] || 0);

    const dispatchedOrders = (statusCounts['DISPATCHED'] || 0) + (statusCounts['DELIVERED'] || 0);

    return res.json({
      success: true,
      analytics: {
        totalOrders,
        pendingOrders,
        dispatchedOrders,
        totalCustomers,
        totalProducts,
        totalRevenue,
        statusDistribution: statusCounts,
        lowStockProducts,
        hardwareStatus: {
          mode: 'DEMO / SIMULATION',
          spoolerRpm: 120,
          chemicalBathTemp: '38.5°C',
          tankStatus: 'OPTIMAL (SIMULATED)',
        },
      },
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve analytics.' });
  }
});

/**
 * GET /api/admin/pricing
 * Current pricing configuration (Section 34)
 */
adminRouter.get('/pricing', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    let config = await prisma.pricingConfig.findUnique({ where: { id: 'default' } });
    if (!config) {
      config = await prisma.pricingConfig.create({ data: { id: 'default' } });
    }
    return res.json({ success: true, config });
  } catch (error) {
    console.error('Pricing fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve pricing.' });
  }
});

/**
 * PATCH /api/admin/pricing
 */
adminRouter.patch('/pricing', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { singlePrice, bundlePrice, customPrice, freeShippingThreshold, standardShippingFee } = req.body;

    const updated = await prisma.pricingConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        singlePrice: singlePrice ? Math.max(0, parseInt(singlePrice)) : 40,
        bundlePrice: bundlePrice ? Math.max(0, parseInt(bundlePrice)) : 100,
        customPrice: customPrice ? Math.max(0, parseInt(customPrice)) : 50,
        freeShippingThreshold: freeShippingThreshold ? Math.max(0, parseInt(freeShippingThreshold)) : 200,
        standardShippingFee: standardShippingFee ? Math.max(0, parseInt(standardShippingFee)) : 40,
      },
      update: {
        singlePrice: singlePrice !== undefined ? Math.max(0, parseInt(singlePrice)) : undefined,
        bundlePrice: bundlePrice !== undefined ? Math.max(0, parseInt(bundlePrice)) : undefined,
        customPrice: customPrice !== undefined ? Math.max(0, parseInt(customPrice)) : undefined,
        freeShippingThreshold: freeShippingThreshold !== undefined ? Math.max(0, parseInt(freeShippingThreshold)) : undefined,
        standardShippingFee: standardShippingFee !== undefined ? Math.max(0, parseInt(standardShippingFee)) : undefined,
      },
    });

    return res.json({ success: true, config: updated });
  } catch (error) {
    console.error('Pricing update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update pricing.' });
  }
});
