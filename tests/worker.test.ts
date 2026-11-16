import { describe, expect, it } from 'vitest'
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose'
import { bearerToken, verifyFirebaseToken } from '../worker/auth'
import { parseProgress } from '../worker/validate'

const PROJECT = 'demo-project'

async function setup() {
  const { publicKey, privateKey } = await generateKeyPair('RS256')
  const keys = createLocalJWKSet({ keys: [{ ...(await exportJWK(publicKey)), alg: 'RS256', kid: 'k1' }] })
  const sign = (claims: { iss?: string; aud?: string; sub?: string; exp?: string }) =>
    new SignJWT({})
      .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
      .setIssuer(claims.iss ?? `https://securetoken.google.com/${PROJECT}`)
      .setAudience(claims.aud ?? PROJECT)
      .setSubject(claims.sub ?? 'user-1')
      .setIssuedAt()
      .setExpirationTime(claims.exp ?? '1h')
      .sign(privateKey)
  return { keys, sign }
}

describe('verifyFirebaseToken', () => {
  it('returns the uid for a valid token', async () => {
    const { keys, sign } = await setup()
    expect(await verifyFirebaseToken(await sign({}), PROJECT, keys)).toBe('user-1')
  })

  it('rejects tokens for another project, expired tokens and garbage', async () => {
    const { keys, sign } = await setup()
    expect(await verifyFirebaseToken(await sign({ aud: 'other' }), PROJECT, keys)).toBeNull()
    expect(await verifyFirebaseToken(await sign({ iss: 'https://evil.example' }), PROJECT, keys)).toBeNull()
    expect(await verifyFirebaseToken(await sign({ exp: '-1h' }), PROJECT, keys)).toBeNull()
    expect(await verifyFirebaseToken('not-a-token', PROJECT, keys)).toBeNull()
  })

  it('rejects a token signed by an unknown key', async () => {
    const { keys } = await setup()
    const other = await setup()
    expect(await verifyFirebaseToken(await other.sign({}), PROJECT, keys)).toBeNull()
  })
})

describe('bearerToken', () => {
  it('extracts the token from the Authorization header', () => {
    const req = (h?: string) => new Request('https://x.test', { headers: h ? { Authorization: h } : {} })
    expect(bearerToken(req('Bearer abc'))).toBe('abc')
    expect(bearerToken(req('Basic abc'))).toBeNull()
    expect(bearerToken(req())).toBeNull()
  })
})

describe('parseProgress', () => {
  it('accepts a well-formed payload and drops unknown fields', () => {
    expect(parseProgress({ done: { 'a#0': true }, notes: { a: 'hi' }, updatedAt: 5, extra: 1 })).toEqual({
      done: { 'a#0': true },
      notes: { a: 'hi' },
      updatedAt: 5,
    })
  })

  it('rejects malformed payloads', () => {
    expect(parseProgress(null)).toBeNull()
    expect(parseProgress({ done: [], notes: {}, updatedAt: 1 })).toBeNull()
    expect(parseProgress({ done: { a: false }, notes: {}, updatedAt: 1 })).toBeNull()
    expect(parseProgress({ done: {}, notes: { a: 1 }, updatedAt: 1 })).toBeNull()
    expect(parseProgress({ done: {}, notes: {}, updatedAt: 'now' })).toBeNull()
  })
})
