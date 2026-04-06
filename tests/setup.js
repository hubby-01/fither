import '@testing-library/jest-dom'
import { webcrypto } from 'node:crypto'

// jsdom doesn't provide crypto.subtle — polyfill from Node
if (!globalThis.crypto?.subtle) {
  globalThis.crypto = webcrypto
}
