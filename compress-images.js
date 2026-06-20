const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, 'public', 'images');

const imagesToConvert = [
  { in: 'heropage.png', out: 'heropage.webp', quality: 75 },
  { in: 'path to success.png', out: 'path-to-success-user.webp', quality: 75 },
  { in: 'roadmap.png', out: 'roadmap.webp', quality: 75 },
  { in: 'aeroplane.png', out: 'aeroplane.webp', quality: 75 },
  { in: 'topview (1).png', out: 'topview.webp', quality: 80 },
  { in: 'welcome Volgo.png', out: 'welcome-volgo.webp', quality: 75 },
  { in: 'REASONS TO CHOOSE.png', out: 'reasons-to-choose.webp', quality: 75 }
];

async function run() {
  console.log('Starting image compression...');
  for (const img of imagesToConvert) {
    const inputPath = path.join(imagesDir, img.in);
    const outputPath = path.join(imagesDir, img.out);

    if (fs.existsSync(inputPath)) {
      console.log(`Compressing ${img.in} -> ${img.out}...`);
      const startSize = fs.statSync(inputPath).size;
      
      await sharp(inputPath)
        .toFormat('webp', { quality: img.quality })
        .toFile(outputPath);

      const endSize = fs.statSync(outputPath).size;
      console.log(`  Done! Saved ${Math.round((startSize - endSize) / 1024)} KB (${Math.round((1 - endSize / startSize) * 100)}% reduction)`);
    } else {
      console.warn(`File not found: ${img.in}`);
    }
  }
  console.log('Compression completed successfully.');
}

run().catch(err => {
  console.error('Error during compression:', err);
});
