import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Roles (chỉ giữ 2 role: ADMIN và CUSTOMER)
  console.log('Creating roles...');
  const roles = await Promise.all([
    prisma.role.create({
      data: { roleName: 'ADMIN', description: 'Manage store operations, products, and users' },
    }),
    prisma.role.create({
      data: { roleName: 'CUSTOMER', description: 'Browse products, place orders, manage account' },
    }),
  ]);
  console.log('Roles created:', roles.length);

  // 2. Create Permissions (giảm bớt, chỉ cần permission cần thiết cho 2 role)
  console.log('Creating permissions...');
  const permissions = await Promise.all([
    prisma.permission.create({ data: { permissionCode: 'VIEW_PRODUCTS', permissionName: 'View Products' } }),
    prisma.permission.create({ data: { permissionCode: 'CREATE_PRODUCT', permissionName: 'Create Product' } }),
    prisma.permission.create({ data: { permissionCode: 'UPDATE_PRODUCT', permissionName: 'Update Product' } }),
    prisma.permission.create({ data: { permissionCode: 'DELETE_PRODUCT', permissionName: 'Delete Product' } }),
    prisma.permission.create({ data: { permissionCode: 'VIEW_ORDERS', permissionName: 'View Orders' } }),
    prisma.permission.create({ data: { permissionCode: 'CREATE_ORDER', permissionName: 'Create Order' } }),
    prisma.permission.create({ data: { permissionCode: 'UPDATE_ORDER', permissionName: 'Update Order' } }),
    prisma.permission.create({ data: { permissionCode: 'DELETE_ORDER', permissionName: 'Delete Order' } }),
    prisma.permission.create({ data: { permissionCode: 'VIEW_USERS', permissionName: 'View Users' } }),
    prisma.permission.create({ data: { permissionCode: 'UPDATE_USER', permissionName: 'Update User' } }),
    prisma.permission.create({ data: { permissionCode: 'MANAGE_PAYMENTS', permissionName: 'Manage Payments' } }),
    prisma.permission.create({ data: { permissionCode: 'VIEW_REPORTS', permissionName: 'View Reports' } }),
  ]);
  console.log('Permissions created:', permissions.length);

  // 3. Assign Permissions to Roles
  console.log('Assigning permissions to roles...');

  // ADMIN gets relevant permissions
  const adminPermissions = permissions.filter(
    (p) =>
      [
        'VIEW_PRODUCTS',
        'CREATE_PRODUCT',
        'UPDATE_PRODUCT',
        'DELETE_PRODUCT',
        'VIEW_ORDERS',
        'CREATE_ORDER',
        'UPDATE_ORDER',
        'DELETE_ORDER',
        'VIEW_USERS',
        'UPDATE_USER',
        'MANAGE_PAYMENTS',
        'VIEW_REPORTS',
      ].includes(p.permissionCode)
  );
  await Promise.all(
    adminPermissions.map((p) =>
      prisma.rolePermission.create({
        data: {
          roleId: roles[0].id,
          permissionId: p.id,
        },
      })
    )
  );

  // CUSTOMER gets relevant permissions
  const customerPermissions = permissions.filter((p) =>
    ['VIEW_PRODUCTS', 'CREATE_ORDER'].includes(p.permissionCode)
  );
  await Promise.all(
    customerPermissions.map((p) =>
      prisma.rolePermission.create({
        data: {
          roleId: roles[1].id,
          permissionId: p.id,
        },
      })
    )
  );

  // 4. Create test users (chỉ 2 tài khoản: admin và user)
  console.log('Creating test users...');
  const adminHashedPassword = await bcrypt.hash('admin123', 10);
  const userHashedPassword = await bcrypt.hash('user123', 10);

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@vixxy.com',
      passwordHash: adminHashedPassword,
      fullName: 'Admin Vixxy',
      phone: '0911223344',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
    },
  });
  await prisma.userRole.create({
    data: {
      userId: admin.id,
      roleId: roles[0].id,
    },
  });
  console.log('✅ Admin created: admin@vixxy.com / admin123');

  // Create customer
  const customer = await prisma.user.create({
    data: {
      email: 'user@vixxy.com',
      passwordHash: userHashedPassword,
      fullName: 'Vixxy Nguyễn',
      phone: '0901234567',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
    },
  });
  await prisma.userRole.create({
    data: {
      userId: customer.id,
      roleId: roles[1].id,
    },
  });
  console.log('✅ Customer created: user@vixxy.com / user123');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
