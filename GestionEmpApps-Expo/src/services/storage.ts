import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const setItem = (key: string, value: any) => {
  storage.set(key, typeof value === 'string' ? value : JSON.stringify(value));
};

export const getItem = (key: string) => {
  const value = storage.getString(key);
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return value;
  }
};

export const removeItem = (key: string) => {
  storage.delete(key);
};

export const clearAll = () => {
  storage.clearAll();
};
