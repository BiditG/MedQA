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

  // create a 32x32 PNG for modern browsers
  await sharp(src).resize(32, 32, { fit: 'cover' }).png().toFile(outPng)
  console.log('Wrote', outPng)

  // prepare PNG buffers at multiple sizes for ICO
  const sizes = [16, 32, 48, 64, 128, 256]
  const buffers = []
  for (const s of sizes) {
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
