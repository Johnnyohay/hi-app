import 'react-native-get-random-values';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as aesjs from 'aes-js';
import * as SecureStore from 'expo-secure-store';

// Supabase sessions (tokens + user metadata) commonly exceed SecureStore's
// ~2KB per-item limit on Android, so the session itself lives in
// AsyncStorage encrypted with a random key, and only that small AES key —
// not the tokens — sits in the OS keychain/keystore via SecureStore.
// This is the storage adapter Supabase's own React Native guide recommends.

async function getOrCreateKey(keyName: string): Promise<Uint8Array> {
  const existing = await SecureStore.getItemAsync(keyName);
  if (existing) return aesjs.utils.hex.toBytes(existing);

  const key = crypto.getRandomValues(new Uint8Array(32));
  await SecureStore.setItemAsync(keyName, aesjs.utils.hex.fromBytes(key));
  return key;
}

export const LargeSecureStore = {
  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;

    const encryptionKey = await getOrCreateKey(`${key}-encryption-key`);
    const bytes = aesjs.utils.hex.toBytes(encrypted);
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    return aesjs.utils.utf8.fromBytes(cipher.decrypt(bytes));
  },

  async setItem(key: string, value: string): Promise<void> {
    const encryptionKey = await getOrCreateKey(`${key}-encryption-key`);
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await AsyncStorage.setItem(key, aesjs.utils.hex.fromBytes(encrypted));
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(`${key}-encryption-key`);
  },
};
