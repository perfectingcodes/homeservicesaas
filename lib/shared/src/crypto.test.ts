import { test } from "node:test";
import assert from "node:assert/strict";
import { encrypt, decrypt, generateKey } from "./crypto";

function withKey(fn: () => void): void {
  const prev = process.env.TOKEN_ENC_KEY;
  process.env.TOKEN_ENC_KEY = generateKey();
  try {
    fn();
  } finally {
    if (prev === undefined) delete process.env.TOKEN_ENC_KEY;
    else process.env.TOKEN_ENC_KEY = prev;
  }
}

test("roundtrip", () => {
  withKey(() => {
    const plain = "ya29.a0AbCDEFG_secret_token";
    const enc = encrypt(plain);
    assert.notStrictEqual(enc, plain);
    assert.strictEqual(decrypt(enc), plain);
  });
});

test("ciphertext changes on each call (random IV)", () => {
  withKey(() => {
    const a = encrypt("same input");
    const b = encrypt("same input");
    assert.notStrictEqual(a, b);
    assert.strictEqual(decrypt(a), "same input");
    assert.strictEqual(decrypt(b), "same input");
  });
});

test("tampered ciphertext fails", () => {
  withKey(() => {
    const enc = encrypt("hello");
    const buf = Buffer.from(enc, "base64");
    buf[buf.length - 1] ^= 0x01;
    const tampered = buf.toString("base64");
    assert.throws(() => decrypt(tampered));
  });
});

test("missing key throws", () => {
  const prev = process.env.TOKEN_ENC_KEY;
  delete process.env.TOKEN_ENC_KEY;
  try {
    assert.throws(() => encrypt("x"), /TOKEN_ENC_KEY/);
  } finally {
    if (prev !== undefined) process.env.TOKEN_ENC_KEY = prev;
  }
});
