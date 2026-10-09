import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { ARCHIVE_CATEGORIES, ARCHIVE_PRODUCTS } from '../src/data/archiveCatalog.ts';

async function main() {
  console.log('--- SEEDING PIXÉ.CO PERSISTENT DARKROOM DATABASE ---');

  // 1. Seed Pricing Config
  await prisma.pricingConfig.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      singlePrice: 40,
      bundlePrice: 100,
      customPrice: 50,
      freeShippingThreshold: 200,
      standardShippingFee: 40,
    },
    update: {},
  });
  console.log('✔ Pricing configuration seeded.');

  // 2. Seed Administrator Account (Section 5)
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@pixe.co').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD is required. Set it in your environment before seeding the database.');
  }

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      name: 'Master Darkroom Printer',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      phone: '+91 98200 12026',
    },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log(`✔ Administrator seeded: ${adminUser.email} (Role: ADMIN)`);

  // 3. Seed Sample Customers
  const customerPassword = 'archival2026!';
  const customerPasswordHash = await bcrypt.hash(customerPassword, 10);

  const customer1 = await prisma.user.upsert({
    where: { email: 'collector@pixe.co' },
    create: {
      name: 'Elena Vance',
      email: 'collector@pixe.co',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      phone: '+91 99100 45678',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    update: {},
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'kabir@pixe.studio' },
    create: {
      name: 'Kabir V.',
      email: 'kabir@pixe.studio',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      phone: '+91 98450 12345',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    update: {},
  });

  // Ensure carts exist
  await prisma.cart.upsert({
    where: { userId: customer1.id },
    create: { userId: customer1.id },
    update: {},
  });
  await prisma.cart.upsert({
    where: { userId: customer2.id },
    create: { userId: customer2.id },
    update: {},
  });

  // Seed sample addresses
  await prisma.address.createMany({
    data: [
      {
        userId: customer1.id,
        fullName: 'Elena Vance',
        phone: '+91 99100 45678',
        addressLine1: 'Flat 402, Heritage Sea Face Apt',
        addressLine2: 'Worli Sea Face',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400018',
        country: 'India',
        isDefault: true,
      },
      {
        userId: customer2.id,
        fullName: 'Kabir V.',
        phone: '+91 98450 12345',
        addressLine1: 'Studio 12, Indiranagar 100ft Road',
        addressLine2: 'Above Blue Tokai',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
        isDefault: true,
      },
    ],
  }).catch(() => {});
  console.log('✔ Sample collectors & addresses seeded.');

  // 4. Seed Categories (Section 15)
  console.log(`Seeding ${ARCHIVE_CATEGORIES.length} database categories...`);
  for (const cat of ARCHIVE_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug || cat.id,
        iconName: cat.iconName,
        featuredImage: cat.featuredImage,
        description: cat.description,
        itemCount: cat.itemCount,
        subcategories: cat.subcategories ? JSON.stringify(cat.subcategories) : null,
      },
      update: {
        name: cat.name,
        slug: cat.slug || cat.id,
        itemCount: cat.itemCount,
      },
    });
  }
  console.log('✔ Categories seeded.');

  // 5. Seed Products (Section 13, 14 - all 360 verified products with exact images)
  console.log(`Seeding ${ARCHIVE_PRODUCTS.length} canonical archival products...`);
  for (const p of ARCHIVE_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        title: p.title,
        subject: p.characterOrSubject || p.subject || p.title,
        category: p.category,
        subcategory: p.subcategory || null,
        franchise: p.franchise || null,
        description: p.description || `${p.title} archival proof.`,
        image: p.image,
        thumbnail: p.thumbnail || p.image,
        price: p.price ?? 40,
        style: p.style || 'Classic',
        stockQuantity: 100,
        featured: Boolean(p.featured),
        popular: Boolean(p.popular),
        trending: Boolean(p.trending),
        tags: JSON.stringify(p.tags || []),
        aliases: p.aliases ? JSON.stringify(p.aliases) : null,
        arcs: p.arcs ? JSON.stringify(p.arcs) : null,
        role: p.role || null,
        crewOrAffiliation: p.crewOrAffiliation || null,
        relationshipGroup: p.relationshipGroup ? JSON.stringify(p.relationshipGroup) : null,
        caption: p.caption || null,
        dateStr: p.dateStr || '10.06.26',
        rotation: p.rotation || 0,
        tapeColor: p.tapeColor || 'yellow',
        imageStatus: p.imageStatus || 'VERIFIED',
      },
      update: {
        title: p.title,
        image: p.image,
        price: p.price ?? 40,
        category: p.category,
        style: p.style || 'Classic',
      },
    });
  }
  console.log('✔ Archival products seeded.');

  // 6. Seed Sample Orders for Customer 1 & 2 (Sections 27, 28)
  const luffy = await prisma.product.findUnique({ where: { id: 'one-piece-monkey-d-luffy' } });
  const messi = await prisma.product.findUnique({ where: { id: 'football-lionel-messi' } });
  const kohli = await prisma.product.findUnique({ where: { id: 'cricket-virat-kohli' } });
  const porsche = await prisma.product.findUnique({ where: { id: 'cars-porsche-911' } });

  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    console.log('Seeding initial darkroom orders...');

    // Order 1: Dispatched (Trio pack)
    const o1 = await prisma.order.create({
      data: {
        orderNumber: 'PX-2026-1049',
        userId: customer1.id,
        status: 'DISPATCHED',
        subtotal: 100,
        shipping: 40,
        total: 140,
        trackingId: 'IND-EMU-849201',
        shippingAddress: JSON.stringify({
          fullName: 'Elena Vance',
          phone: '+91 99100 45678',
          addressLine1: 'Flat 402, Heritage Sea Face Apt',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400018',
        }),
        paymentMethod: 'upi',
        items: {
          create: [
            {
              productId: luffy?.id,
              productTitleSnapshot: luffy?.title || 'Monkey D. Luffy — Joyboy',
              productImageSnapshot: luffy?.image || '',
              quantity: 1,
              unitPrice: 40,
              subtotal: 40,
              caption: 'straw hat joyboy',
              frameStyle: 'Manga Panel',
            },
            {
              productId: messi?.id,
              productTitleSnapshot: messi?.title || 'Lionel Messi — World Cup Glory',
              productImageSnapshot: messi?.image || '',
              quantity: 1,
              unitPrice: 40,
              subtotal: 40,
              caption: 'world champion glory · messi',
              frameStyle: 'Sports Action',
            },
            {
              productId: kohli?.id,
              productTitleSnapshot: kohli?.title || 'Virat Kohli — Master of the Chase',
              productImageSnapshot: kohli?.image || '',
              quantity: 1,
              unitPrice: 40,
              subtotal: 40,
              caption: 'king kohli master of chase',
              frameStyle: 'Sports Action',
            },
          ],
        },
      },
    });

    // Order 2: In Exposure
    await prisma.order.create({
      data: {
        orderNumber: 'PX-2026-1082',
        userId: customer2.id,
        status: 'OPTICAL_EXPOSURE',
        subtotal: 80,
        shipping: 40,
        total: 120,
        trackingId: 'IND-EMU-918234',
        shippingAddress: JSON.stringify({
          fullName: 'Kabir V.',
          phone: '+91 98450 12345',
          addressLine1: 'Studio 12, Indiranagar 100ft Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
        }),
        paymentMethod: 'card',
        items: {
          create: [
            {
              productId: porsche?.id,
              productTitleSnapshot: porsche?.title || 'Porsche 911 Turbo (930)',
              productImageSnapshot: porsche?.image || '',
              quantity: 2,
              unitPrice: 40,
              subtotal: 80,
              caption: 'air-cooled whale tail 930',
              frameStyle: 'Vintage Film',
            },
          ],
        },
      },
    });

    console.log('✔ Initial darkroom orders created.');
  }

  console.log('=== SEED COMPLETE. DARKROOM READY. ===');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
