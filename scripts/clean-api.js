import fs from 'fs';
import path from 'path';

if (process.env.VERCEL === '1') {
  const filePath = path.join(process.cwd(), 'api', 'index.ts');
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log('Successfully deleted api/index.ts in Vercel environment.');
  }
} else {
  console.log('Skipping api/index.ts deletion (not running in Vercel).');
}
