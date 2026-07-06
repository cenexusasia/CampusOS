// Vercel monorepo deployment configuration
// This file tells Vercel to deploy from apps/web
// while installing dependencies from the root

const { execSync } = require('child_process');

// Use Vercel's API to update the project settings
async function main() {
  try {
    const token = execSync('vercel whoami --token', { encoding: 'utf8' }).trim();
    console.log('Token obtained:', token ? `${token.slice(0, 8)}...` : 'none');
    
    if (!token) {
      console.log('No token available — need manual Vercel dashboard config');
      return;
    }
    
    const https = require('https');
    const data = JSON.stringify({
      rootDirectory: 'apps/web',
      framework: 'nextjs',
      buildCommand: 'pnpm install && pnpm build --filter=@campusos/web',
      installCommand: 'pnpm install',
      outputDirectory: 'apps/web/.next',
    });
    
    const req = https.request({
      hostname: 'api.vercel.com',
      path: '/v2/projects/prj_85QDE2PYawXNAfBtQkAxqLYMeooK',
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', body.slice(0, 300));
      });
    });
    
    req.write(data);
    req.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
