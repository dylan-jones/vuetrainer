import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose'

const FIREBASE_JWKS_URL =
  'https://www.googleapis.com/service_account/v1/jwk/securetoken@system.gserviceaccount.com'

let remoteKeys: JWTVerifyGetKey | undefined

export const firebaseKeys = (): JWTVerifyGetKey => (remoteKeys ??= createRemoteJWKSet(new URL(FIREBASE_JWKS_URL)))

/** Verifies a Firebase ID token and returns the user's uid, or null if it is invalid. */
export async function verifyFirebaseToken(
  token: string,
  projectId: string,
  keys: JWTVerifyGetKey = firebaseKeys(),
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, keys, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ['RS256'],
    })
    return typeof payload.sub === 'string' && payload.sub ? payload.sub : null
  } catch {
    return null
  }
}

export function bearerToken(request: Request): string | null {
  const match = /^Bearer\s+(.+)$/i.exec(request.headers.get('Authorization') ?? '')
  return match ? match[1]!.trim() : null
}
