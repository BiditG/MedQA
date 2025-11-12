#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
// jimp and png-to-ico are ESM; import them dynamically inside main

async function main() {
  const src = path.join(__dirname, '..', 'public', 'data', 'logo.jpg')
  const outPng = path.join(__dirname, '..', 'public', 'favicon.png')
  const outIco = path.join(__dirname, '..', 'public', 'favicon.ico')

  if (!fs.existsSync(src)) {
    console.error('Source logo not found:', src)
    process.exit(2)
  }

  // dynamic import of ESM modules (use sharp for reliable resizing)
  const sharpModule = await import('sharp')
  const sharp = sharpModule.default || sharpModule
  const pngToIcoModule = await import('png-to-ico')
  const pngToIco = pngToIcoModule.default || pngToIcoModule

  // generate a set of PNG favicons for various platforms
  const pngSizes = [16, 32, 48, 64, 128, 180, 192, 256, 512]
  for (const s of pngSizes) {
    const outP = path.join(__dirname, '..', 'public', `favicon-${s}x${s}.png`)
    await sharp(src).resize(s, s, { fit: 'cover' }).png().toFile(outP)
    console.log('Wrote', outP)
  }

  // also write canonical favicon.png (32x32) and apple/android filenames
  await sharp(src).resize(32, 32, { fit: 'cover' }).png().toFile(outPng)
  console.log('Wrote', outPng)
  await sharp(src)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'))
  await sharp(src)
    .resize(192, 192, { fit: 'cover' })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'android-chrome-192x192.png'))
  await sharp(src)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'android-chrome-512x512.png'))
  await sharp(src)
    .resize(150, 150, { fit: 'cover' })
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'mstile-150x150.png'))

  // prepare PNG buffers at several sizes for ICO (common sizes)
  const icoSizes = [16, 32, 48, 64, 128, 256]
  const buffers = []
  for (const s of icoSizes) {
    const buf = await sharp(src).resize(s, s, { fit: 'cover' }).png().toBuffer()
    buffers.push(buf)
  }

  const icoBuf = await pngToIco(buffers)
  fs.writeFileSync(outIco, icoBuf)
  console.log('Wrote', outIco)
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
