const ENCRYPTED_DATABASE_MAGIC = "kanban-encrypted-database";
const ENCRYPTED_DATABASE_VERSION = 1;
const KDF_ITERATIONS = 600000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function createRandomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function assertCryptoAvailable() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error(
      "Ta przeglądarka nie udostępnia Web Crypto API. Otwórz aplikację w aktualnym Chrome albo Edge."
    );
  }
}

async function deriveEncryptionKey(password, salt, iterations = KDF_ITERATIONS) {
  assertCryptoAvailable();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations,
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

export function isEncryptedDatabasePayload(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      value.magic === ENCRYPTED_DATABASE_MAGIC &&
      value.encrypted === true &&
      typeof value.payload === "string" &&
      value.crypto?.cipher === "AES-GCM"
  );
}

export async function encryptKanbanDatabase(data, password) {
  if (!password || !password.trim()) {
    throw new Error("Hasło do bazy nie może być puste.");
  }

  const salt = createRandomBytes(SALT_BYTES);
  const iv = createRandomBytes(IV_BYTES);
  const key = await deriveEncryptionKey(password, salt);
  const plaintext = encoder.encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    plaintext
  );

  return {
    magic: ENCRYPTED_DATABASE_MAGIC,
    version: ENCRYPTED_DATABASE_VERSION,
    encrypted: true,
    createdAt: new Date().toISOString(),
    crypto: {
      cipher: "AES-GCM",
      kdf: "PBKDF2",
      hash: "SHA-256",
      iterations: KDF_ITERATIONS,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
    },
    payload: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

export async function decryptKanbanDatabase(envelope, password) {
  if (!isEncryptedDatabasePayload(envelope)) {
    throw new Error("To nie wygląda jak zaszyfrowana baza Kanbana.");
  }

  if (!password || !password.trim()) {
    throw new Error("Podaj hasło do bazy.");
  }

  try {
    const salt = base64ToBytes(envelope.crypto.salt);
    const iv = base64ToBytes(envelope.crypto.iv);
    const ciphertext = base64ToBytes(envelope.payload);
    const key = await deriveEncryptionKey(
      password,
      salt,
      Number(envelope.crypto.iterations) || KDF_ITERATIONS
    );

    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      ciphertext
    );

    return JSON.parse(decoder.decode(plaintext));
  } catch (error) {
    throw new Error(
      "Nie udało się odszyfrować bazy. Sprawdź hasło albo upewnij się, że plik nie został uszkodzony."
    );
  }
}
