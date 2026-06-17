import { PrismaClient, UserStatus, AddressType, SkuStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed operations...');

  // 1. Seed Permissions
  const permissionsData = [
    { name: 'user:read', description: 'View user accounts' },
    { name: 'user:write', description: 'Create and modify user accounts' },
    { name: 'role:write', description: 'Manage system roles' },
    { name: 'product:write', description: 'Create, modify and delete products and pricing' },
    { name: 'product:read', description: 'Browse and inspect products' },
    { name: 'inventory:read', description: 'Check warehouse stock counts' },
    { name: 'inventory:write', description: 'Modify inventory levels and adjustments' },
    { name: 'quotation:write', description: 'Draft and edit quotations' },
    { name: 'quotation:approve', description: 'Approve or reject customer quotations' },
    { name: 'order:write', description: 'Place and manage orders' },
    { name: 'order:read', description: 'View client orders' },
    { name: 'support:write', description: 'Respond to customer tickets' },
    { name: 'system:settings', description: 'Modify system-wide settings' },
    { name: 'analytics:read', description: 'View dashboard metrics and summaries' },
  ];

  console.log('Seeding Permissions...');
  const permissions: Record<string, any> = {};
  for (const perm of permissionsData) {
    permissions[perm.name] = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // 2. Seed Roles
  console.log('Seeding Roles...');
  const roleSuperAdmin = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Full system administrator privileges',
    },
  });

  const roleStoreExecutive = await prisma.role.upsert({
    where: { name: 'STORE_EXECUTIVE' },
    update: {},
    create: {
      name: 'STORE_EXECUTIVE',
      description: 'Operations, inventory, order processing and client quotations',
    },
  });

  const roleCustomer = await prisma.role.upsert({
    where: { name: 'CUSTOMER' },
    update: {},
    create: {
      name: 'CUSTOMER',
      description: 'End customer mobile/web access',
    },
  });

  // 3. Map Role Permissions
  console.log('Mapping Role Permissions...');
  
  // Super Admin - All Permissions
  for (const permKey of Object.keys(permissions)) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roleSuperAdmin.id,
          permissionId: permissions[permKey].id,
        },
      },
      update: {},
      create: {
        roleId: roleSuperAdmin.id,
        permissionId: permissions[permKey].id,
      },
    });
  }

  // Store Executive Permissions
  const executivePerms = [
    'user:read',
    'product:read',
    'inventory:read',
    'inventory:write',
    'quotation:write',
    'order:read',
    'order:write',
    'support:write',
  ];
  for (const name of executivePerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roleStoreExecutive.id,
          permissionId: permissions[name].id,
        },
      },
      update: {},
      create: {
        roleId: roleStoreExecutive.id,
        permissionId: permissions[name].id,
      },
    });
  }

  // Customer Permissions
  const customerPerms = [
    'product:read',
    'order:write',
    'order:read',
  ];
  for (const name of customerPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roleCustomer.id,
          permissionId: permissions[name].id,
        },
      },
      update: {},
      create: {
        roleId: roleCustomer.id,
        permissionId: permissions[name].id,
      },
    });
  }

  // 4. Create Default Users (Pre-computed BCrypt hashes for 'Password123!')
  console.log('Seeding Users...');
  const adminPasswordHash = "$2a$10$ka/DoBLmP82dZRR.ItmY6.fbdftjHo.kcwBcV8ZpV2rIs2Af.NfGm";
  const execPasswordHash = "$2a$10$ka/DoBLmP82dZRR.ItmY6.fbdftjHo.kcwBcV8ZpV2rIs2Af.NfGm";
  const custPasswordHash = "$2a$10$ka/DoBLmP82dZRR.ItmY6.fbdftjHo.kcwBcV8ZpV2rIs2Af.NfGm";

  // Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@vipaasa.com' },
    update: {},
    create: {
      email: 'admin@vipaasa.com',
      passwordHash: adminPasswordHash,
      phoneNumber: '9999999999',
      status: UserStatus.ACTIVE,
      roleId: roleSuperAdmin.id,
      profile: {
        create: {
          firstName: 'Vipaasa',
          lastName: 'Administrator',
        },
      },
    },
  });

  // Store Executive
  await prisma.user.upsert({
    where: { email: 'executive@vipaasa.com' },
    update: {},
    create: {
      email: 'executive@vipaasa.com',
      passwordHash: execPasswordHash,
      phoneNumber: '8888888888',
      status: UserStatus.ACTIVE,
      roleId: roleStoreExecutive.id,
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Executive',
        },
      },
    },
  });

  // Customer
  await prisma.user.upsert({
    where: { email: 'customer@vipaasa.com' },
    update: {},
    create: {
      email: 'customer@vipaasa.com',
      passwordHash: custPasswordHash,
      phoneNumber: '7777777777',
      status: UserStatus.ACTIVE,
      roleId: roleCustomer.id,
      profile: {
        create: {
          firstName: 'Alice',
          lastName: 'Smith',
          addresses: {
            create: {
              addressType: AddressType.SHIPPING,
              isDefault: true,
              addressLine1: 'Flat 101, Green Meadows',
              addressLine2: 'Sector 4',
              city: 'Bengaluru',
              state: 'Karnataka',
              postalCode: '560001',
              country: 'India',
            },
          },
        },
      },
    },
  });

  // 5. Create Default Warehouses
  console.log('Seeding Warehouse details...');
  await prisma.warehouse.upsert({
    where: { code: 'WH-CENTRAL' },
    update: {},
    create: {
      name: 'Central Organic Distribution Hub',
      code: 'WH-CENTRAL',
      addressLine1: 'Plot 42, Logistics Industrial Zone',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560099',
      country: 'India',
      isActive: true,
    },
  });

  console.log('Seed operations completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
