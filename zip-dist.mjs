import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { zipSync } from 'fflate'

const projectRoot = dirname(fileURLToPath(import.meta.url))

const sourceDir = join(projectRoot, 'dist-local')
const outputDir = join(projectRoot, 'paczki-offline')
const outputFile = join(outputDir, 'dist-local.zip')

if (!existsSync(sourceDir)) {
  console.error('Nie ma folderu "dist-local". Najpierw uruchom: npm run build')
  process.exit(1)
}

mkdirSync(outputDir, {
  recursive: true,
})

// usuwa starą paczkę, jeśli już była
rmSync(outputFile, {
  force: true,
})

const files = {}

function addFolderToZip(folderPath) {
  const entries = readdirSync(folderPath)

  for (const entry of entries) {
    const fullPath = join(folderPath, entry)
    const stats = statSync(fullPath)

    if (stats.isDirectory()) {
      addFolderToZip(fullPath)
    } else {
      const zipPath = relative(projectRoot, fullPath).split(sep).join('/')
      files[zipPath] = new Uint8Array(readFileSync(fullPath))
    }
  }
}

addFolderToZip(sourceDir)

const zipped = zipSync(files, {
  level: 9,
})

writeFileSync(outputFile, zipped)

console.log(`Gotowe: paczki-offline/dist-local.zip`)
console.log(`Pełna ścieżka: ${outputFile}`)
console.log(`Spakowano ${Object.keys(files).length} plików.`)