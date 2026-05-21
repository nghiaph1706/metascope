import crypto from "node:crypto";

export function verifyPayOSSignatureRaw(
  rawBody: Buffer,
  signature: string,
  checksumKey: string,
): boolean {
  if (!signature || !checksumKey) return false;
  if (!/^[a-f0-9]+$/i.test(signature) || signature.length % 2 !== 0) return false;

  const digest = crypto.createHmac("sha256", checksumKey).update(rawBody).digest("hex");
  const expected = Buffer.from(digest, "hex");
  const provided = Buffer.from(signature, "hex");
  if (expected.length !== provided.length) return false;

  return crypto.timingSafeEqual(expected, provided);
}
