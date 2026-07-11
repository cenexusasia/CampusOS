/**
 * Deploy seed script for Railway — CommonJS version.
 * Run with: node deploy/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database with De La Salle demo data...');

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // 1. Plan
  const professionalPlan = await prisma.plan.upsert({
    where: { id: 'plan_professional' },
    update: {},
    create: {
      id: 'plan_professional',
      name: 'Professional',
      tier: 'PROFESSIONAL',
      price: 299,
      currency: 'USD',
      features: { dashboard: true, advancedAnalytics: true, prioritySupport: true, courses: 50, documents: 10000, aiAssist: true, sso: true, api: true },
      maxUsers: 500,
      maxConnectors: 5,
      maxStorageMb: 102400,
      aiCreditsMonthly: 50000,
    },
  });

  // 2. Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'dlsu' },
    update: {},
    create: {
      id: 'tenant_dlsu',
      name: 'De La Salle Philippines',
      slug: 'dlsu',
      domain: 'dlsu.edu.ph',
      planId: professionalPlan.id,
      status: 'ACTIVE',
      settings: { timezone: 'Asia/Manila', locale: 'en-PH', academicYear: '2025-2026', semester: '1st Semester', branding: { primaryColor: '#007A3D', accentColor: '#FFCC00' } },
    },
  });

  // 3. Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dlsu.edu.ph' },
    update: {},
    create: {
      id: 'dlsu_admin',
      email: 'admin@dlsu.edu.ph',
      name: 'Dr. Maria Reyes',
      passwordHash: hashedPassword,
      emailVerified: new Date(),
    },
  });

  await prisma.tenantMembership.upsert({
    where: { userId_tenantId: { userId: adminUser.id, tenantId: tenant.id } },
    update: {},
    create: { userId: adminUser.id, tenantId: tenant.id, role: 'OWNER', permissions: ['dashboard:view','users:view','users:create','users:edit','students:view','courses:view','courses:create','courses:edit','faculty:view','departments:view','analytics:view','settings:view','settings:edit','ai:access','ai:admin','connectors:view','connectors:manage','audit:view'] },
  });

  // 4. Departments
  const deptDefs = [
    { id: 'dept_cs', name: 'Computer Science', code: 'CS', description: 'Department of Computer Science' },
    { id: 'dept_ds', name: 'Data Science', code: 'DS', description: 'Department of Data Science' },
    { id: 'dept_math', name: 'Mathematics', code: 'MATH', description: 'Department of Mathematics' },
    { id: 'dept_eng', name: 'English', code: 'ENG', description: 'Department of English' },
    { id: 'dept_bus', name: 'Business', code: 'BUS', description: 'Department of Business' },
    { id: 'dept_phy', name: 'Physics', code: 'PHY', description: 'Department of Physics' },
  ];
  const departments = {};
  for (const d of deptDefs) {
    departments[d.id] = await prisma.department.upsert({
      where: { id: d.id },
      update: {},
      create: { ...d, tenantId: tenant.id },
    });
  }

  // 5. Faculty
  const facultyDefs = [
    { id: 'fac_sarah_chen', email: 'sarah.chen@dlsu.edu.ph', name: 'Dr. Sarah Chen' },
    { id: 'fac_michael_torres', email: 'michael.torres@dlsu.edu.ph', name: 'Prof. Michael Torres' },
    { id: 'fac_james_park', email: 'james.park@dlsu.edu.ph', name: 'Dr. James Park' },
    { id: 'fac_emily_davis', email: 'emily.davis@dlsu.edu.ph', name: 'Prof. Emily Davis' },
    { id: 'fac_robert_kim', email: 'robert.kim@dlsu.edu.ph', name: 'Dr. Robert Kim' },
    { id: 'fac_lisa_martinez', email: 'lisa.martinez@dlsu.edu.ph', name: 'Prof. Lisa Martinez' },
    { id: 'fac_maria_reyes', email: 'maria.reyes@dlsu.edu.ph', name: 'Dr. Maria Reyes' },
    { id: 'fac_antonio_cruz', email: 'antonio.cruz@dlsu.edu.ph', name: 'Prof. Antonio Cruz' },
  ];
  for (const f of facultyDefs) {
    const user = await prisma.user.upsert({
      where: { email: f.email },
      update: {},
      create: { id: f.id, email: f.email, name: f.name, passwordHash: hashedPassword, emailVerified: new Date() },
    });
    await prisma.tenantMembership.upsert({
      where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
      update: {},
      create: { userId: user.id, tenantId: tenant.id, role: 'ADMIN', permissions: ['dashboard:view','students:view','courses:view','courses:edit','ai:access','analytics:view'] },
    });
  }

  // 6. Courses
  const courseDefs = [
    { id: 'course_cs301', name: 'Data Structures and Algorithms', code: 'CS 301', credits: 3, description: 'Arrays, linked lists, trees, graphs, algorithmic analysis.' },
    { id: 'course_cs450', name: 'Software Engineering', code: 'CS 450', credits: 3, description: 'Software design, methodologies, testing, project management.' },
    { id: 'course_cs401', name: 'Machine Learning', code: 'CS 401', credits: 4, description: 'Supervised/unsupervised learning, neural networks, deep learning.' },
    { id: 'course_ds401', name: 'Data Mining and Analytics', code: 'DS 401', credits: 3, description: 'Data mining, pattern recognition, predictive modeling.' },
    { id: 'course_math202', name: 'Linear Algebra', code: 'MATH 202', credits: 3, description: 'Vector spaces, matrices, eigenvalues, applications.' },
    { id: 'course_math301', name: 'Calculus III', code: 'MATH 301', credits: 4, description: 'Multivariable calculus, vector fields, Stokes theorems.' },
    { id: 'course_eng101', name: 'English Composition', code: 'ENG 101', credits: 3, description: 'Academic writing, critical thinking, communication.' },
    { id: 'course_eng201', name: 'Technical Writing', code: 'ENG 201', credits: 3, description: 'Technical and professional writing, reports, proposals.' },
    { id: 'course_bus201', name: 'Principles of Management', code: 'BUS 201', credits: 3, description: 'Management theory, organizational behavior, strategy.' },
    { id: 'course_bus310', name: 'Business Analytics', code: 'BUS 310', credits: 3, description: 'Data-driven decision making, statistical analysis, BI tools.' },
    { id: 'course_phy101', name: 'General Physics I', code: 'PHY 101', credits: 4, description: 'Mechanics, thermodynamics, waves, electromagnetism.' },
    { id: 'course_phy201', name: 'General Physics II', code: 'PHY 201', credits: 4, description: 'Electromagnetism, optics, quantum physics.' },
  ];
  const courses = {};
  for (const c of courseDefs) {
    courses[c.id] = await prisma.course.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, tenantId: tenant.id, name: c.name, code: c.code, description: c.description, credits: c.credits, status: 'ACTIVE' },
    });
  }

  // Sections
  for (const c of courseDefs) {
    await prisma.section.create({
      data: {
        courseId: courses[c.id].id,
        name: `${c.code} — Section A`,
        capacity: 35,
        schedule: { days: ['Monday','Wednesday','Friday'], time: '09:00-10:30', room: 'Room ' + (100 + Math.floor(Math.random() * 20)) },
      },
    });
  }

  // 7. Students (20 Filipino names)
  const studentDefs = [
    { id: 'stu_juan_cruz', email: 'juan.cruz@dlsu.edu.ph', name: 'Juan dela Cruz' },
    { id: 'stu_maria_santos', email: 'maria.santos@dlsu.edu.ph', name: 'Maria Santos' },
    { id: 'stu_jose_rizal', email: 'jose.rizal@dlsu.edu.ph', name: 'Jose Rizal' },
    { id: 'stu_ana_garcia', email: 'ana.garcia@dlsu.edu.ph', name: 'Ana Garcia' },
    { id: 'stu_carlos_mendoza', email: 'carlos.mendoza@dlsu.edu.ph', name: 'Carlos Mendoza' },
    { id: 'stu_luz_villanueva', email: 'luz.villanueva@dlsu.edu.ph', name: 'Luz Villanueva' },
    { id: 'stu_andres_bonifacio', email: 'andres.bonifacio@dlsu.edu.ph', name: 'Andres Bonifacio' },
    { id: 'stu_emilio_aguinaldo', email: 'emilio.aguinaldo@dlsu.edu.ph', name: 'Emilio Aguinaldo' },
    { id: 'stu_gabriela_silang', email: 'gabriela.silang@dlsu.edu.ph', name: 'Gabriela Silang' },
    { id: 'stu_apolinario_mabini', email: 'apolinario.mabini@dlsu.edu.ph', name: 'Apolinario Mabini' },
    { id: 'stu_marcelo_del_pilar', email: 'marcelo.delpilar@dlsu.edu.ph', name: 'Marcelo H. del Pilar' },
    { id: 'stu_antonio_luna', email: 'antonio.luna@dlsu.edu.ph', name: 'Antonio Luna' },
    { id: 'stu_melchora_aquino', email: 'melchora.aquino@dlsu.edu.ph', name: 'Melchora Aquino' },
    { id: 'stu_grace_poe', email: 'grace.poe@dlsu.edu.ph', name: 'Grace Poe' },
    { id: 'stu_manuel_roxas', email: 'manuel.roxas@dlsu.edu.ph', name: 'Manuel Roxas' },
    { id: 'stu_claro_recto', email: 'claro.recto@dlsu.edu.ph', name: 'Claro M. Recto' },
    { id: 'stu_fernando_amorsolo', email: 'fernando.amorsolo@dlsu.edu.ph', name: 'Fernando Amorsolo' },
    { id: 'stu_leona_florentino', email: 'leona.florentino@dlsu.edu.ph', name: 'Leona Florentino' },
    { id: 'stu_teodora_alonzo', email: 'teodora.alonzo@dlsu.edu.ph', name: 'Teodora Alonzo' },
    { id: 'stu_jose_ab_santos', email: 'jose.abadsantos@dlsu.edu.ph', name: 'Jose Abad Santos' },
  ];
  const students = {};
  const courseIds = courseDefs.map(c => c.id);
  const grades = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 5.0];
  const weights = [0.08, 0.12, 0.15, 0.18, 0.20, 0.12, 0.07, 0.05, 0.02, 0.01];

  function weightedGrade() {
    const r = Math.random();
    let cum = 0;
    for (let i = 0; i < grades.length; i++) {
      cum += weights[i];
      if (r <= cum) return grades[i];
    }
    return 2.0;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  for (const s of studentDefs) {
    students[s.id] = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { id: s.id, email: s.email, name: s.name, passwordHash: hashedPassword, emailVerified: new Date() },
    });
    await prisma.tenantMembership.upsert({
      where: { userId_tenantId: { userId: students[s.id].id, tenantId: tenant.id } },
      update: {},
      create: { userId: students[s.id].id, tenantId: tenant.id, role: 'MEMBER', permissions: ['dashboard:view','courses:view','ai:access'] },
    });
  }

  // Enrollments
  const enrollments = [];
  for (const s of studentDefs) {
    const n = 2 + Math.floor(Math.random() * 3);
    const shuffled = shuffle(courseIds);
    for (let i = 0; i < n && i < shuffled.length; i++) {
      enrollments.push({ courseId: courses[shuffled[i]].id, userId: students[s.id].id, status: 'ENROLLED', grade: weightedGrade() });
    }
  }
  await prisma.courseEnrollment.createMany({ data: enrollments, skipDuplicates: true });

  // 8. Documents
  const docs = [
    { id: 'doc_handbook', name: 'Student Handbook 2025-2026', chunks: ['The university upholds faith, zeal for service, and communion in mission.', 'Academic dishonesty is strictly prohibited and may result in expulsion.', 'Grading scale: 1.0 (Excellent) to 5.0 (Failing).', 'Minimum GPA of 2.0 required for good standing.', 'Student services include library, counseling, career services, and health clinic.'] },
    { id: 'doc_cs_curriculum', name: 'CS Curriculum Guide', chunks: ['BS CS requires 135 credit units.', 'Core courses: CS 301, CS 401, CS 450, DS 401, MATH 202.', 'Capstone research project required in final year.', 'Electives include AI, cybersecurity, cloud computing, mobile dev.'] },
    { id: 'doc_bus_handbook', name: 'Business Program Requirements', chunks: ['Majors in Management, Marketing, Finance, Entrepreneurship.', 'Must complete BUS 201 and BUS 310 as core.', '240-hour internship mandatory for graduation.'] },
    { id: 'doc_faculty_guide', name: 'Faculty Guidelines', chunks: ['Syllabus due one week before classes start.', 'Grades due within 5 working days after exams.', 'Research grants and conference funding available.'] },
    { id: 'doc_lab_manual', name: 'Physics Lab Manual', chunks: ['Pre-lab report due 24h before session.', 'Goggles and lab coats mandatory.', 'Reports must follow scientific format.', 'Data fabrication is academic dishonesty.'] },
  ];
  const chunkData = [];
  for (const doc of docs) {
    await prisma.document.upsert({
      where: { id: doc.id },
      update: {},
      create: { id: doc.id, tenantId: tenant.id, name: doc.name, description: '', filePath: `/documents/${doc.id}.pdf`, mimeType: 'application/pdf', size: 51200, status: 'PROCESSED' },
    });
    doc.chunks.forEach((content, i) => {
      chunkData.push({ documentId: doc.id, content, chunkIndex: i });
    });
  }
  await prisma.documentChunk.createMany({ data: chunkData, skipDuplicates: true });

  console.log('✅ De La Salle seed complete!');
  console.log(`   Tenant: ${tenant.name}`);
  console.log(`   Admin: admin@dlsu.edu.ph / Admin123!`);
  console.log(`   Courses: ${courseDefs.length}, Faculty: ${facultyDefs.length}, Students: ${studentDefs.length}`);
  console.log(`   Enrollments: ${enrollments.length}`);
}

seed()
  .catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
