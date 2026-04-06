import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '..')

function readFile(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf-8')
}

describe('Phase 0 — Project Bootstrap', () => {
  it('vite.config.js contains base: \'/fither/\'', () => {
    const content = readFile('vite.config.js')
    expect(content).toContain("base: '/fither/'")
  })

  it('tailwind.config.js content array includes src/**/*.{js,jsx}', () => {
    const content = readFile('tailwind.config.js')
    expect(content).toContain('src/**/*.{js,jsx}')
  })

  it('index.html title is "FitHer"', () => {
    const content = readFile('index.html')
    expect(content).toContain('<title>FitHer</title>')
  })

  it('public/robots.txt disallows all crawlers', () => {
    const content = readFile('public/robots.txt')
    expect(content).toContain('User-agent: *')
    expect(content).toContain('Disallow: /')
  })

  it('.github/workflows/deploy.yml exists and contains publish_dir: ./dist', () => {
    const content = readFile('.github/workflows/deploy.yml')
    expect(content).toContain('publish_dir: ./dist')
  })
})
