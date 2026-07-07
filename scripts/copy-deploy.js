const fs = require('fs-extra');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const API_DIST = path.join(ROOT, 'apps/api/dist');
const DEPLOY_DIR = path.join(ROOT, 'apps/api/deploy');
const DEPLOY_DIST = path.join(DEPLOY_DIR, 'dist');

async function main() {
  // Copy compiled dist
  console.log('📁 Copying dist to deploy...');
  await fs.emptyDir(DEPLOY_DIST);
  await fs.copy(API_DIST, DEPLOY_DIST);
  console.log(`   ✅ ${fs.readdirSync(DEPLOY_DIST).length} items copied`);

  // Copy prisma schema
  await fs.copy(path.join(ROOT, 'apps/api/prisma'), path.join(DEPLOY_DIR, 'prisma'));
  console.log('📁 Prisma schema copied');

  // Install production deps in deploy dir
  console.log('📦 Installing production deps...');
  const { execSync } = require('child_process');
  execSync('npm install --production --ignore-scripts', {
    cwd: DEPLOY_DIR,
    stdio: 'pipe',
  });
  console.log('   ✅ Done');
}

main().catch(console.error);
