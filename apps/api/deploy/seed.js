// Railway-compatible seed runner for document chunks
// Run: railway run "node seed.js"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Check if chunks already exist
  const existingChunks = await prisma.documentChunk.count();
  if (existingChunks > 0) {
    console.log(`Document chunks already exist (${existingChunks}). Skipping.`);
    return;
  }
  
  // Find or create documents, then add chunks
  const courses = await prisma.course.findMany({ take: 5 });
  if (courses.length === 0) {
    console.log('No courses found. Skipping document creation.');
    return;
  }
  
  let totalChunks = 0;
  for (const course of courses) {
    // Check if document already exists for this course
    let doc = await prisma.document.findFirst({ where: { name: `${course.name} Syllabus`, tenantId: course.tenantId } });
    if (!doc) {
      doc = await prisma.document.create({
        data: {
          name: `${course.name} Syllabus`,
          mimeType: 'application/pdf',
          size: Math.floor(Math.random() * 500000) + 50000,
          status: 'READY',
          tenantId: course.tenantId,
        },
      });
    }
    
    const chunks = [
      `${course.name} - Course Overview: This course covers fundamental concepts in ${course.name}. Students learn through lectures, assignments, and projects.`,
      `Prerequisites: Students should have completed introductory courses in ${course.department || 'the relevant field'}.`,
      `Assessment: Grades based on midterm (30%), final (40%), assignments (20%), participation (10%).`,
      `Textbook: Standard textbook for ${course.name} as recommended by the ${course.department || 'department'}.`,
    ];
    
    const existingDocChunks = await prisma.documentChunk.count({ where: { documentId: doc.id } });
    if (existingDocChunks === 0) {
      for (let i = 0; i < chunks.length; i++) {
        await prisma.documentChunk.create({
          data: { documentId: doc.id, content: chunks[i], chunkIndex: i, metadata: { source: 'seed' } },
        });
      }
      totalChunks += chunks.length;
      console.log(`  ${doc.name}: ${chunks.length} chunks`);
    }
  }
  
  // Verify analytics data exists
  const enrollmentCount = await prisma.enrollment.count();
  const studentCount = await prisma.student.count();
  const userCount = await prisma.user.count();
  
  console.log(`\n✅ Seed verification complete:`);
  console.log(`   Tenants: ${await prisma.tenant.count()}`);
  console.log(`   Users: ${userCount}`);
  console.log(`   Courses: ${await prisma.course.count()}`);
  console.log(`   Students: ${studentCount}`);
  console.log(`   Enrollments: ${enrollmentCount}`);
  console.log(`   Document chunks: ${totalChunks}`);
  console.log(`   Connectors: ${await prisma.connector.count()}`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
