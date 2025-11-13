const path = require('path')

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .filter((f) => {
      // normalize to forward-slash for consistent checks on Windows
      const rel = path.relative(process.cwd(), f).replace(/\\\\/g, '/')
      // skip test files, anything under scripts/, and public/ directory
      return (
        !rel.includes('test-') &&
        !rel.startsWith('scripts/') &&
        !rel.startsWith('public/')
      )
    })
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`

module.exports = {
  '*.{js,jsx,ts,tsx}': [
    buildEslintCommand,
    'prettier --ignore-path .gitignore --write',
  ],
}
