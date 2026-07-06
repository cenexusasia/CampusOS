import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function seed(): Promise<void> {
  console.log('🌱 Seeding database...');

  // ---- Plans ---------------------------------------------------------------

  const starterPlan = await prisma.plan.upsert({
    where: { id: 'plan_starter' },
    update: {},
    create: {
      id: 'plan_starter',
      name: 'Starter',
      tier: 'STARTER',
      price: 0,
      currency: 'USD',
      features: {
        dashboard: true,
        basicAnalytics: true,
        emailSupport: true,
        courses: 5,
        documents: 100,
      },
      maxUsers: 10,
      maxConnectors: 1,
      maxStorageMb: 1024, // 1GB
      aiCreditsMonthly: 1000,
    },
  });

  const professionalPlan = await prisma.plan.upsert({
    where: { id: 'plan_professional' },
    update: {},
    create: {
      id: 'plan_professional',
      name: 'Professional',
      tier: 'PROFESSIONAL',
      price: 299,
      currency: 'USD',
      features: {
        dashboard: true,
        advancedAnalytics: true,
        prioritySupport: true,
        courses: 50,
        documents: 10000,
        aiAssist: true,
        sso: true,
        api: true,
      },
      maxUsers: 500,
      maxConnectors: 5,
      maxStorageMb: 102400, // 100GB
      aiCreditsMonthly: 50000,
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { id: 'plan_enterprise' },
    update: {},
    create: {
      id: 'plan_enterprise',
      name: 'Enterprise',
      tier: 'ENTERPRISE',
      price: 999,
      currency: 'USD',
      features: {
        dashboard: true,
        advancedAnalytics: true,
        dedicatedSupport: true,
        courses: -1, // unlimited
        documents: -1,
        aiAssist: true,
        sso: true,
        saml: true,
        oidc: true,
        api: true,
        customBranding: true,
        auditLogs: true,
        sla: true,
        dataResidency: true,
      },
      maxUsers: 10000,
      maxConnectors: 20,
      maxStorageMb: 1048576, // 1TB
      aiCreditsMonthly: 500000,
    },
  });

  // ---- Demo Tenant ---------------------------------------------------------

  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-university' },
    update: {},
    create: {
      id: 'tenant_demo',
      name: 'Demo University',
      slug: 'demo-university',
      domain: 'demo.university.edu',
      planId: professionalPlan.id,
      status: 'TRIAL',
      settings: {
        timezone: 'America/New_York',
        locale: 'en-US',
        academicYear: '2025-2026',
        branding: {
          primaryColor: '#1E40AF',
          accentColor: '#3B82F6',
        },
      },
    },
  });

  // ---- Demo Users ----------------------------------------------------------

  const demoAdmin = await prisma.user.upsert({
    where: { email: 'admin@demo.university.edu' },
    update: {},
    create: {
      id: 'user_admin',
      email: 'admin@demo.university.edu',
      name: 'Dr. Sarah Chen',
      // In production, use bcrypt. This is a demo only.
      passwordHash: '$2b$10$EPY9LSloBSUA2B1U2JPJaeGhZgRvHCGX5JLxBH4nBGXG9f.vM7FPi', // "Demo1234!"
      emailVerified: new Date(),
    },
  });

  const demoInstructor = await prisma.user.upsert({
    where: { email: 'prof.johnson@demo.university.edu' },
    update: {},
    create: {
      id: 'user_instructor',
      email: 'prof.johnson@demo.university.edu',
      name: 'Prof. Marcus Johnson',
      passwordHash: '$2b$10$EPY9LSloBSUA2B1U2JPJaeGhZgRvHCGX5JLxBH4nBGXG9f.vM7FPi',
      emailVerified: new Date(),
    },
  });

  const demoStudent = await prisma.user.upsert({
    where: { email: 'emma.wilson@demo.university.edu' },
    update: {},
    create: {
      id: 'user_student',
      email: 'emma.wilson@demo.university.edu',
      name: 'Emma Wilson',
      passwordHash: '$2b$10$EPY9LSloBSUA2B1U2JPJaeGhZgRvHCGX5JLxBH4nBGXG9f.vM7FPi',
      emailVerified: new Date(),
    },
  });

  // ---- Tenant Memberships ---------------------------------------------------

  await prisma.tenantMembership.upsert({
    where: {
      userId_tenantId: { userId: demoAdmin.id, tenantId: demoTenant.id },
    },
    update: {},
    create: {
      userId: demoAdmin.id,
      tenantId: demoTenant.id,
      role: 'OWNER',
      permissions: [
        'dashboard:view',
        'users:view',
        'users:create',
        'users:edit',
        'students:view',
        'courses:view',
        'courses:create',
        'courses:edit',
        'faculty:view',
        'departments:view',
        'analytics:view',
        'settings:view',
        'settings:edit',
        'ai:access',
        'ai:admin',
        'connectors:view',
        'connectors:manage',
        'audit:view',
      ],
    },
  });

  await prisma.tenantMembership.upsert({
    where: {
      userId_tenantId: { userId: demoInstructor.id, tenantId: demoTenant.id },
    },
    update: {},
    create: {
      userId: demoInstructor.id,
      tenantId: demoTenant.id,
      role: 'ADMIN',
      permissions: [
        'dashboard:view',
        'students:view',
        'courses:view',
        'courses:edit',
        'ai:access',
        'analytics:view',
      ],
    },
  });

  await prisma.tenantMembership.upsert({
    where: {
      userId_tenantId: { userId: demoStudent.id, tenantId: demoTenant.id },
    },
    update: {},
    create: {
      userId: demoStudent.id,
      tenantId: demoTenant.id,
      role: 'MEMBER',
      permissions: ['dashboard:view', 'courses:view', 'ai:access'],
    },
  });

  // ---- Demo Departments -----------------------------------------------------

  const csDept = await prisma.department.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Computer Science',
      code: 'CS',
      description: 'Department of Computer Science and Engineering',
    },
  });

  const mathDept = await prisma.department.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Mathematics',
      code: 'MATH',
      description: 'Department of Mathematics and Statistics',
    },
  });

  // ---- Demo Courses ---------------------------------------------------------

  const dsCourse = await prisma.course.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Introduction to Data Science',
      code: 'CS-201',
      description:
        'An introduction to data science concepts including data wrangling, visualization, and statistical analysis.',
      credits: 3,
      status: 'ACTIVE',
    },
  });

  const mlCourse = await prisma.course.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Machine Learning',
      code: 'CS-401',
      description:
        'Advanced course covering supervised and unsupervised learning algorithms, neural networks, and deep learning.',
      credits: 4,
      status: 'ACTIVE',
    },
  });

  const calculusCourse = await prisma.course.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Calculus III',
      code: 'MATH-301',
      description: 'Multivariable calculus, vector analysis, and partial differential equations.',
      credits: 4,
      status: 'ACTIVE',
    },
  });

  // ---- Demo Enrollments -----------------------------------------------------

  await prisma.courseEnrollment.createMany({
    data: [
      { courseId: dsCourse.id, userId: demoStudent.id, status: 'ENROLLED' },
      { courseId: mlCourse.id, userId: demoStudent.id, status: 'ENROLLED' },
      { courseId: calculusCourse.id, userId: demoStudent.id, status: 'ENROLLED' },
    ],
    skipDuplicates: true,
  });

  // ---- Demo Audit Logs ------------------------------------------------------

  await prisma.auditLog.create({
    data: {
      tenantId: demoTenant.id,
      userId: demoAdmin.id,
      action: 'CREATE',
      resource: 'tenants',
      resourceId: demoTenant.id,
      details: { source: 'seed' },
    },
  });

  console.log('✅ Seed complete!');
  console.log('   Plans:', `${starterPlan.tier}, ${professionalPlan.tier}, ${enterprisePlan.tier}`);
  console.log('   Tenant:', demoTenant.name, `(${demoTenant.slug})`);
  console.log(
    '   Users:',
    `${demoAdmin.email} (OWNER),`,
    `${demoInstructor.email} (ADMIN),`,
    `${demoStudent.email} (MEMBER)`,
  );
  console.log('   Departments:', `${csDept.code}, ${mathDept.code}`);
  console.log('   Courses:', `${dsCourse.code}, ${mlCourse.code}, ${calculusCourse.code}`);
  console.log('\n   Demo password for all users: Demo1234!');
}

seed()
  .catch((error: unknown) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
