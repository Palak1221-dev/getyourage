import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs';

async function generate() {
  const svgBuffer = fs.readFileSync('public/favicon.svg');
  
  // apple-touch-icon.png (180x180)
  await sharp(svgBuffer).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  
  // favicon-32x32.png
  await sharp(svgBuffer).resize(32, 32).png().toFile('public/favicon-32x32.png');
  
  // favicon-16x16.png
  await sharp(svgBuffer).resize(16, 16).png().toFile('public/favicon-16x16.png');
  
  // favicon.ico
  const icoBuffer = await pngToIco(['public/favicon-32x32.png', 'public/favicon-16x16.png']);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  
  console.log('Icons generated successfully.');
}

generate().catch(console.error);
