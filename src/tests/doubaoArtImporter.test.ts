import { describe, expect, it } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'

const root = process.cwd()
const sourcePath = join(root, 'art-source/doubao/cards/basic_slash.png')
const targetPath = join(root, 'public/assets/cards/basic_slash.svg')

const samplePngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAE0lEQVR4nGPcoiHHAANMcBZeDgAybgEC27bU6QAAAABJRU5ErkJggg=='

describe('Doubao art importer', () => {
  it('wraps a raster Doubao export in the stable SVG asset path', () => {
    const backupDir = mkdtempSync(join(tmpdir(), 'hongchen-art-'))
    const backupSvg = join(backupDir, 'basic_slash.svg')
    const originalSourceExisted = existsSync(sourcePath)
    const originalSource = originalSourceExisted ? readFileSync(sourcePath) : undefined

    writeFileSync(backupSvg, readFileSync(targetPath))

    try {
      mkdirSync(join(root, 'art-source/doubao/cards'), { recursive: true })
      writeFileSync(sourcePath, Buffer.from(samplePngBase64, 'base64'))
      execFileSync('python3', ['scripts/import-doubao-art.py'], { cwd: root, stdio: 'pipe' })

      const svg = readFileSync(targetPath, 'utf-8')
      expect(svg).toContain('data-generated-by="doubao"')
      expect(svg).toContain('data-source="art-source/doubao/cards/basic_slash.png"')
      expect(svg).toContain('<image')
      expect(svg).toContain('data:image/png;base64,')
      expect(svg).toContain('viewBox="0 0 120 160"')
    } finally {
      writeFileSync(targetPath, readFileSync(backupSvg))
      if (originalSourceExisted && originalSource) {
        writeFileSync(sourcePath, originalSource)
      } else if (existsSync(sourcePath)) {
        rmSync(sourcePath)
      }
      rmSync(backupDir, { recursive: true, force: true })
    }
  })
})
