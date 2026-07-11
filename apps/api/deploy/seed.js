// Railway-compatible seed runner
// Run: railway run "node seed.js"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Checking existing data...');
  const existingTenants = await prisma.tenant.count();
  if (existingTenants > 0) {
    console.log(`Data already exists (${existingTenants} tenants). Skipping seed.`);
    return;
  }
  
  // Document chunks: create a few sample documents
  const documents = await prisma.document.findMany({ take: 1 });
  if (documents.length === 0) {
    console.log('No documents found. Creating sample documents...');
    // Create sample documents from existing courses
    const courses = await prisma.course.findMany({ take: 3 });
    for (const course of courses) {
      const doc = await prisma.document.create({
        data: {
          name: `${course.name} Syllabus`,
          mimeType: 'application/pdf',
          size: Math.floor(Math.random() * 500000) + 50000,
          status: 'READY',
          tenantId: course.tenantId,
        },
      });
      // Create chunks
      const chunks = [
        `${course.name} - Course Overview: This course covers fundamental concepts and advanced topics in ${course.name}. Students will learn through lectures, assignments, and projects.`,
        `Prerequisites: Students should have completed introductory courses in ${course.department || 'the relevant field'} before enrolling in this course.`,
        `Assessment: Grades are based on midterm exams (30%), final exams (40%), assignments (20%), and class participation (10%).`,
      ];
      for (let i = 0; i < chunks.length; i++) {
        await prisma.documentChunk.create({
          data: { documentId: doc.id, content: chunks[i], chunkIndex: i, metadata: {} },
        });
      }
      console.log(`  Created: ${doc.name} (${chunks.length} chunks)`);
    }
  }
  
  console.log('Seed complete!');
}

run().catch(console.error).finally(() => prisma.$disconnect());
