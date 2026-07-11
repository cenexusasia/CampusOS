import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed(): Promise<void> {
  console.log('🌱 Seeding database with De La Salle demo data...');

  // Password hash
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // ====== 1. PLANS ======
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
      maxStorageMb: 102400,
      aiCreditsMonthly: 50000,
    },
  });

  // ====== 2. TENANT: De La Salle Philippines ======
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
      settings: {
        timezone: 'Asia/Manila',
        locale: 'en-PH',
        academicYear: '2025-2026',
        semester: '1st Semester',
        branding: {
          primaryColor: '#007A3D',
          accentColor: '#FFCC00',
          logo: 'https://www.dlsu.edu.ph/wp-content/uploads/2023/09/dlsu-logo.png',
        },
      },
    },
  });
  console.log(`   Tenant: ${tenant.name} (${tenant.slug})`);

  // ====== 3. ADMIN USER ======
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
    where: {
      userId_tenantId: { userId: adminUser.id, tenantId: tenant.id },
    },
    update: {},
    create: {
      userId: adminUser.id,
      tenantId: tenant.id,
      role: 'OWNER',
      permissions: [
        'dashboard:view','users:view','users:create','users:edit',
        'students:view','courses:view','courses:create','courses:edit',
        'faculty:view','departments:view','analytics:view',
        'settings:view','settings:edit','ai:access','ai:admin',
        'connectors:view','connectors:manage','audit:view',
      ],
    },
  });
  console.log(`   Admin: ${adminUser.email}`);

  // ====== 4. DEPARTMENTS ======
  const departmentsData = [
    { id: 'dept_cs',   name: 'Computer Science',          code: 'CS',   description: 'Department of Computer Science and Engineering' },
    { id: 'dept_ds',   name: 'Data Science',              code: 'DS',   description: 'Department of Data Science and Analytics' },
    { id: 'dept_math',  name: 'Mathematics',               code: 'MATH', description: 'Department of Mathematics and Statistics' },
    { id: 'dept_eng',   name: 'English and Literature',    code: 'ENG',  description: 'Department of English and Comparative Literature' },
    { id: 'dept_bus',   name: 'Business Administration',   code: 'BUS',  description: 'Department of Business Administration and Management' },
    { id: 'dept_phy',   name: 'Physics',                   code: 'PHY',  description: 'Department of Physics and Applied Physics' },
  ];

  const departments: Record<string, any> = {};
  for (const d of departmentsData) {
    departments[d.id] = await prisma.department.upsert({
      where: { id: d.id },
      update: {},
      create: { ...d, tenantId: tenant.id },
    });
  }
  console.log(`   Departments: ${departmentsData.map(d => d.code).join(', ')}`);

  // ====== 5. FACULTY (8 instructors) ======
  const facultyData = [
    { id: 'fac_sarah_chen',   email: 'sarah.chen@dlsu.edu.ph',     name: 'Dr. Sarah Chen',         deptId: 'dept_cs' },
    { id: 'fac_michael_torres', email: 'michael.torres@dlsu.edu.ph', name: 'Prof. Michael Torres',   deptId: 'dept_bus' },
    { id: 'fac_james_park',    email: 'james.park@dlsu.edu.ph',    name: 'Dr. James Park',          deptId: 'dept_ds' },
    { id: 'fac_emily_davis',   email: 'emily.davis@dlsu.edu.ph',   name: 'Prof. Emily Davis',       deptId: 'dept_eng' },
    { id: 'fac_robert_kim',    email: 'robert.kim@dlsu.edu.ph',    name: 'Dr. Robert Kim',          deptId: 'dept_math' },
    { id: 'fac_lisa_martinez', email: 'lisa.martinez@dlsu.edu.ph', name: 'Prof. Lisa Martinez',     deptId: 'dept_phy' },
    { id: 'fac_maria_reyes',   email: 'maria.reyes@dlsu.edu.ph',   name: 'Dr. Maria Reyes',         deptId: 'dept_cs' },
    { id: 'fac_antonio_cruz',  email: 'antonio.cruz@dlsu.edu.ph',  name: 'Prof. Antonio Cruz',      deptId: 'dept_bus' },
  ];

  const faculty: Record<string, any> = {};
  for (const f of facultyData) {
    faculty[f.id] = await prisma.user.upsert({
      where: { email: f.email },
      update: {},
      create: {
        id: f.id,
        email: f.email,
        name: f.name,
        passwordHash: hashedPassword,
        emailVerified: new Date(),
      },
    });
    await prisma.tenantMembership.upsert({
      where: {
        userId_tenantId: { userId: faculty[f.id].id, tenantId: tenant.id },
      },
      update: {},
      create: {
        userId: faculty[f.id].id,
        tenantId: tenant.id,
        role: 'ADMIN',
        permissions: ['dashboard:view','students:view','courses:view','courses:edit','ai:access','analytics:view'],
      },
    });
  }
  console.log(`   Faculty: ${facultyData.length} instructors`);

  // ====== 6. COURSES (12 courses) ======
  const coursesData = [
    { id: 'course_cs301',  name: 'Data Structures and Algorithms',  code: 'CS 301',  credits: 3, deptId: 'dept_cs',   instructor: 'Dr. Sarah Chen',   description: 'Study of fundamental data structures (arrays, linked lists, trees, graphs) and algorithmic analysis techniques.' },
    { id: 'course_cs450',  name: 'Software Engineering',            code: 'CS 450',  credits: 3, deptId: 'dept_cs',   instructor: 'Dr. Maria Reyes',   description: 'Principles of software design, development methodologies, testing, and project management.' },
    { id: 'course_cs401',  name: 'Machine Learning',                code: 'CS 401',  credits: 4, deptId: 'dept_cs',   instructor: 'Dr. Sarah Chen',   description: 'Supervised and unsupervised learning, neural networks, deep learning, and model evaluation.' },
    { id: 'course_ds401',  name: 'Data Mining and Analytics',       code: 'DS 401',  credits: 3, deptId: 'dept_ds',   instructor: 'Dr. James Park',    description: 'Data mining techniques, pattern recognition, predictive modeling, and big data analytics.' },
    { id: 'course_math202', name: 'Linear Algebra',                 code: 'MATH 202', credits: 3, deptId: 'dept_math', instructor: 'Dr. Robert Kim',   description: 'Vector spaces, linear transformations, matrices, eigenvalues, and applications.' },
    { id: 'course_math301', name: 'Calculus III',                   code: 'MATH 301', credits: 4, deptId: 'dept_math', instructor: 'Dr. Robert Kim',   description: 'Multivariable calculus, vector fields, line and surface integrals, and Stokes theorems.' },
    { id: 'course_eng101',  name: 'English Composition',            code: 'ENG 101',  credits: 3, deptId: 'dept_eng',  instructor: 'Prof. Emily Davis', description: 'Foundations of academic writing, critical thinking, and effective communication.' },
    { id: 'course_eng201',  name: 'Technical Writing',              code: 'ENG 201',  credits: 3, deptId: 'dept_eng',  instructor: 'Prof. Emily Davis', description: 'Writing for technical and professional contexts — reports, proposals, documentation.' },
    { id: 'course_bus201',  name: 'Principles of Management',       code: 'BUS 201',  credits: 3, deptId: 'dept_bus',  instructor: 'Prof. Michael Torres', description: 'Fundamentals of management theory, organizational behavior, and strategic planning.' },
    { id: 'course_bus310',  name: 'Business Analytics',             code: 'BUS 310',  credits: 3, deptId: 'dept_bus',  instructor: 'Prof. Antonio Cruz', description: 'Data-driven decision making, statistical analysis, and business intelligence tools.' },
    { id: 'course_phy101',  name: 'General Physics I',              code: 'PHY 101',  credits: 4, deptId: 'dept_phy',  instructor: 'Prof. Lisa Martinez', description: 'Classical mechanics, thermodynamics, waves, and introductory electromagnetism.' },
    { id: 'course_phy201',  name: 'General Physics II',             code: 'PHY 201',  credits: 4, deptId: 'dept_phy',  instructor: 'Prof. Lisa Martinez', description: 'Electromagnetism, optics, quantum physics, and nuclear physics.' },
  ];

  const courses: Record<string, any> = {};
  for (const c of coursesData) {
    courses[c.id] = await prisma.course.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        tenantId: tenant.id,
        name: c.name,
        code: c.code,
        description: c.description,
        credits: c.credits,
        status: 'ACTIVE',
      },
    });
  }
  console.log(`   Courses: ${coursesData.length} courses created`);

  // Create sections for each course
  const sections: Record<string, any> = {};
  for (const c of coursesData) {
    const section = await prisma.section.create({
      data: {
        courseId: courses[c.id].id,
        name: `${c.code} — Section A`,
        capacity: 35,
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: '09:00-10:30',
          room: `Room ${100 + Math.floor(Math.random() * 20)}`,
        },
      },
    });
    sections[c.id] = section;
  }
  console.log(`   Sections: ${coursesData.length} sections created`);

  // ====== 7. STUDENTS (20 with Filipino names) ======
  const studentsData = [
    { id: 'stu_juan_cruz',     email: 'juan.cruz@dlsu.edu.ph',       name: 'Juan dela Cruz' },
    { id: 'stu_maria_santos',  email: 'maria.santos@dlsu.edu.ph',    name: 'Maria Santos' },
    { id: 'stu_jose_rizal',    email: 'jose.rizal@dlsu.edu.ph',      name: 'Jose Rizal' },
    { id: 'stu_ana_garcia',    email: 'ana.garcia@dlsu.edu.ph',      name: 'Ana Garcia' },
    { id: 'stu_carlos_mendoza', email: 'carlos.mendoza@dlsu.edu.ph', name: 'Carlos Mendoza' },
    { id: 'stu_luz_villanueva', email: 'luz.villanueva@dlsu.edu.ph', name: 'Luz Villanueva' },
    { id: 'stu_andres_bonifacio', email: 'andres.bonifacio@dlsu.edu.ph', name: 'Andres Bonifacio' },
    { id: 'stu_emilio_aguinaldo', email: 'emilio.aguinaldo@dlsu.edu.ph', name: 'Emilio Aguinaldo' },
    { id: 'stu_gabriela_silang', email: 'gabriela.silang@dlsu.edu.ph', name: 'Gabriela Silang' },
    { id: 'stu_apolinario_mabini', email: 'apolinario.mabini@dlsu.edu.ph', name: 'Apolinario Mabini' },
    { id: 'stu_marcelo_del_pilar', email: 'marcelo.delpilar@dlsu.edu.ph', name: 'Marcelo H. del Pilar' },
    { id: 'stu_antonio_luna', email: 'antonio.luna@dlsu.edu.ph',      name: 'Antonio Luna' },
    { id: 'stu_melchora_aquino', email: 'melchora.aquino@dlsu.edu.ph', name: 'Melchora Aquino' },
    { id: 'stu_grace_poe',     email: 'grace.poe@dlsu.edu.ph',        name: 'Grace Poe' },
    { id: 'stu_manuel_roxas',  email: 'manuel.roxas@dlsu.edu.ph',     name: 'Manuel Roxas' },
    { id: 'stu_claro_recto',   email: 'claro.recto@dlsu.edu.ph',      name: 'Claro M. Recto' },
    { id: 'stu_fernando_amorsolo', email: 'fernando.amorsolo@dlsu.edu.ph', name: 'Fernando Amorsolo' },
    { id: 'stu_leona_ florentino', email: 'leona.florentino@dlsu.edu.ph', name: 'Leona Florentino' },
    { id: 'stu_teodora_alonzo', email: 'teodora.alonzo@dlsu.edu.ph',  name: 'Teodora Alonzo' },
    { id: 'stu_jose_ab_ad',    email: 'jose.abadsantos@dlsu.edu.ph',  name: 'Jose Abad Santos' },
  ];

  // Fix the ID with space
  studentsData[17] = { id: 'stu_leona_florentino', email: 'leona.florentino@dlsu.edu.ph', name: 'Leona Florentino' };

  const students: Record<string, any> = {};
  for (const s of studentsData) {
    students[s.id] = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        id: s.id,
        email: s.email,
        name: s.name,
        passwordHash: hashedPassword,
        emailVerified: new Date(),
      },
    });
    await prisma.tenantMembership.upsert({
      where: {
        userId_tenantId: { userId: students[s.id].id, tenantId: tenant.id },
      },
      update: {},
      create: {
        userId: students[s.id].id,
        tenantId: tenant.id,
        role: 'MEMBER',
        permissions: ['dashboard:view', 'courses:view', 'ai:access'],
      },
    });
  }
  console.log(`   Students: ${studentsData.length} students created`);

  // ====== 8. ENROLLMENTS ======
  // Each student enrolled in 2-4 random courses, with realistic grades
  const courseIds = coursesData.map(c => c.id);
  const grades = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 5.0];
  const gradeWeights = [0.08, 0.12, 0.15, 0.18, 0.20, 0.12, 0.07, 0.05, 0.02, 0.01];

  function weightedRandomGrade(): number {
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < grades.length; i++) {
      cumulative += gradeWeights[i]!;
      if (r <= cumulative) return grades[i]!;
    }
    return 2.0;
  }

  function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  }

  let totalEnrollments = 0;
  const enrollmentData: { courseId: string; userId: string; status: string; grade: number }[] = [];

  for (const s of studentsData) {
    const numCourses = 2 + Math.floor(Math.random() * 3); // 2-4 courses
    const shuffled = shuffleArray(courseIds);
    for (let i = 0; i < numCourses && i < shuffled.length; i++) {
      enrollmentData.push({
        courseId: courses[shuffled[i]!].id,
        userId: students[s.id].id,
        status: 'ENROLLED',
        grade: weightedRandomGrade(),
      });
      totalEnrollments++;
    }
  }

  await prisma.courseEnrollment.createMany({
    data: enrollmentData,
    skipDuplicates: true,
  });
  console.log(`   Enrollments: ${totalEnrollments} enrollments created`);

  // ====== 9. SECTION ENROLLMENTS ======
  const sectionEnrollmentData: { sectionId: string; userId: string; status: string }[] = [];
  for (const s of studentsData) {
    const numCourses = 2 + Math.floor(Math.random() * 3);
    const shuffled = shuffleArray(courseIds);
    for (let i = 0; i < numCourses && i < shuffled.length; i++) {
      sectionEnrollmentData.push({
        sectionId: sections[shuffled[i]!].id,
        userId: students[s.id].id,
        status: 'ENROLLED',
      });
    }
  }

  await prisma.sectionEnrollment.createMany({
    data: sectionEnrollmentData,
    skipDuplicates: true,
  });
  console.log(`   Section enrollments: ${sectionEnrollmentData.length} created`);

  // ====== 10. DOCUMENTS & DOCUMENT CHUNKS ======
  const documentsData = [
    {
      id: 'doc_handbook',
      name: 'Student Handbook 2025-2026',
      description: 'Official student handbook for DLSU academic year 2025-2026',
      chunks: [
        'De La Salle University is a Catholic educational institution committed to providing quality education rooted in the Lasallian tradition. The university upholds the values of faith, zeal for service, and communion in mission.',
        'All students are expected to maintain academic integrity. Plagiarism, cheating, and other forms of academic dishonesty are strictly prohibited and may result in disciplinary action including expulsion.',
        'The grading system at DLSU uses the following scale: 1.0 (Excellent), 1.5 (Very Good), 2.0 (Good), 2.5 (Satisfactory), 3.0 (Passing), 5.0 (Failing). A grade of 4.0 is considered conditional.',
        'Students must maintain a minimum GPA of 2.0 per semester to remain in good academic standing. Students below this threshold will be placed on academic probation.',
        'The university offers various student services including the library, counseling center, career services, and health clinic. All enrolled students are entitled to use these services.',
      ],
    },
    {
      id: 'doc_cs_curriculum',
      name: 'Computer Science Curriculum Guide',
      description: 'Curriculum guide for BS Computer Science program',
      chunks: [
        'The BS Computer Science program requires completion of 135 credit units distributed across general education, core computer science courses, professional electives, and a capstone project.',
        'Core courses include CS 301 Data Structures and Algorithms, CS 401 Machine Learning, CS 450 Software Engineering, DS 401 Data Mining, and MATH 202 Linear Algebra.',
        'Students must complete a capstone research project in their final year, demonstrating proficiency in software development, research methodology, and technical communication.',
        'Professional electives cover specialized topics including artificial intelligence, cybersecurity, cloud computing, mobile development, and computer graphics.',
      ],
    },
    {
      id: 'doc_bus_handbook',
      name: 'Business Program Requirements',
      description: 'Requirements and policies for the Business Administration program',
      chunks: [
        'The Business Administration program offers majors in Management, Marketing, Finance, and Entrepreneurship. Each major requires 12 units of specialized coursework.',
        'All business students must complete BUS 201 Principles of Management and BUS 310 Business Analytics as part of the core curriculum.',
        'Internship experience is mandatory for graduation. Students must complete at least 240 hours of supervised industry internship.',
      ],
    },
    {
      id: 'doc_faculty_guide',
      name: 'Faculty Guidelines and Policies',
      description: 'Policies and guidelines for DLSU faculty members',
      chunks: [
        'Faculty members are expected to post syllabus and course materials at least one week before the start of classes. All materials must be accessible through the university LMS.',
        'Grade submission deadlines are strictly enforced. Final grades must be submitted within 5 working days after the final examination period.',
        'Faculty development programs are available including research grants, conference funding, and pedagogical training workshops.',
      ],
    },
    {
      id: 'doc_lab_manual',
      name: 'Physics Laboratory Manual',
      description: 'Standard operating procedures for physics laboratory experiments',
      chunks: [
        'All laboratory experiments require a pre-lab report submitted 24 hours before the scheduled session. Late submissions will incur a grade deduction.',
        'Safety protocols must be observed at all times. Goggles and lab coats are mandatory in all laboratory sessions.',
        'Experiment reports must follow the standard scientific format: Abstract, Introduction, Methodology, Results, Discussion, and Conclusion.',
        'Data fabrication or falsification in laboratory reports constitutes academic dishonesty and will be dealt with according to university policies.',
      ],
    },
  ];

  const docChunkContents: { documentId: string; content: string; chunkIndex: number }[] = [];

  for (const doc of documentsData) {
    await prisma.document.upsert({
      where: { id: doc.id },
      update: {},
      create: {
        id: doc.id,
        tenantId: tenant.id,
        name: doc.name,
        description: doc.description,
        filePath: `/documents/${doc.id}.pdf`,
        mimeType: 'application/pdf',
        size: 1024 * 50,
        status: 'PROCESSED',
      },
    });

    doc.chunks.forEach((content, index) => {
      docChunkContents.push({
        documentId: doc.id,
        content,
        chunkIndex: index,
      });
    });
  }

  try {
    await prisma.documentChunk.createMany({
      data: docChunkContents,
      skipDuplicates: true,
    });
    console.log(`   Documents: ${documentsData.length} documents with ${docChunkContents.length} chunks`);
  } catch (e: any) {
    console.log(`   ⚠️ Documents skipped: ${e.message || 'table may not exist'}`);
  }

  // ====== 11. AUDIT LOGS ======
  const auditLogsData = [
    { action: 'CREATE', resource: 'tenants',     resourceId: tenant.id,          details: { source: 'seed', tenant: 'dlsu' } },
    { action: 'CREATE', resource: 'users',       resourceId: adminUser.id,       details: { role: 'OWNER' } },
    { action: 'CREATE', resource: 'departments',  resourceId: departments['dept_cs'].id,  details: { code: 'CS' } },
    { action: 'CREATE', resource: 'departments',  resourceId: departments['dept_math'].id, details: { code: 'MATH' } },
    { action: 'CREATE', resource: 'departments',  resourceId: departments['dept_ds'].id,   details: { code: 'DS' } },
    { action: 'CREATE', resource: 'departments',  resourceId: departments['dept_eng'].id,  details: { code: 'ENG' } },
    { action: 'CREATE', resource: 'departments',  resourceId: departments['dept_bus'].id,  details: { code: 'BUS' } },
    { action: 'CREATE', resource: 'departments',  resourceId: departments['dept_phy'].id,  details: { code: 'PHY' } },
    { action: 'CREATE', resource: 'courses',     resourceId: courses['course_cs301'].id,  details: { code: 'CS 301' } },
    { action: 'CREATE', resource: 'courses',     resourceId: courses['course_cs450'].id,  details: { code: 'CS 450' } },
    { action: 'CREATE', resource: 'courses',     resourceId: courses['course_cs401'].id,  details: { code: 'CS 401' } },
    { action: 'CREATE', resource: 'courses',     resourceId: courses['course_ds401'].id,  details: { code: 'DS 401' } },
    { action: 'CREATE', resource: 'courses',     resourceId: courses['course_math202'].id, details: { code: 'MATH 202' } },
    { action: 'CREATE', resource: 'courses',     resourceId: courses['course_math301'].id, details: { code: 'MATH 301' } },
    { action: 'CREATE', resource: 'courses',     resourceId: courses['course_eng101'].id,  details: { code: 'ENG 101' } },
    { action: 'CREATE', resource: 'courses',     resourceId: courses['course_eng201'].id,  details: { code: 'ENG 201' } },
    { action: 'CREATE', resource: 'courses',     resourceId: courses['course_bus201'].id,  details: { code: 'BUS 201' } },
    { action: 'CREATE', resource: 'courses',     resourceId: courses['course_bus310'].id,  details: { code: 'BUS 310' } },
    { action: 'CREATE', resource: 'courses',     resourceId: courses['course_phy101'].id,  details: { code: 'PHY 101' } },
    { action: 'CREATE', resource: 'courses',     resourceId: courses['course_phy201'].id,  details: { code: 'PHY 201' } },
    { action: 'SEED',  resource: 'enrollments',  resourceId: tenant.id,          details: { totalEnrollments, totalStudents: studentsData.length } },
  ];

  for (const log of auditLogsData) {
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: adminUser.id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        details: log.details,
      },
    });
  }
  console.log(`   Audit logs: ${auditLogsData.length} entries`);

  // ====== 12. SUMMARY ======
  const courseEnrollmentCount = await prisma.courseEnrollment.count({
    where: { course: { tenantId: tenant.id } },
  });
  console.log('\n========================================');
  console.log('✅ De La Salle seed complete!');
  console.log('========================================');
  console.log(`   Tenant:        ${tenant.name}`);
  console.log(`   Admin:         admin@dlsu.edu.ph / Admin123!`);
  console.log(`   Departments:   ${departmentsData.length}`);
  console.log(`   Courses:       ${coursesData.length}`);
  console.log(`   Faculty:       ${facultyData.length}`);
  console.log(`   Students:      ${studentsData.length}`);
  console.log(`   Enrollments:   ${courseEnrollmentCount}`);
  console.log(`   Documents:     ${documentsData.length}`);
  console.log(`   Audit Logs:    ${auditLogsData.length}`);
  console.log('========================================\n');
}

seed()
  .catch((error: unknown) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
