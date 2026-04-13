import { describe, it, expect } from 'vitest'
import { isWebApiUnavailableError } from '../api'

describe('isWebApiUnavailableError', () => {
  it('detects transformed command-prefixed web API unavailable strings', () => {
    const error = 'Error: get_settings: Web API unavailable: start the app with pnpm dev:web'
    expect(isWebApiUnavailableError(error)).toBe(true)
  })

  it('detects direct Error objects with web API unavailable message', () => {
    const error = new Error('Web API unavailable: start the app with pnpm dev:web')
    expect(isWebApiUnavailableError(error)).toBe(true)
  })
})
