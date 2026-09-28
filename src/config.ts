import { Platform } from 'react-native';

/**
 * Backend origin only. No Gemini / Pinecone / Supabase secrets belong here.
 *
 * Android emulator reaches the host machine via 10.0.2.2.
 * On a physical device, set this to your computer's LAN IP, e.g. http://192.168.1.10:5000
 * In production, set this to the deployed backend URL.
 */
const DEV_ORIGIN =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

// export const API_ORIGIN = (__DEV__ ? DEV_ORIGIN : 'https://simpans-ai-backend.onrender.com').replace(
//   /\/$/,
//   '',
// );


export const API_ORIGIN = ('https://simpans-ai-backend.onrender.com').replace(
  /\/$/,
  '',
);
export const API_BASE_URL = `${API_ORIGIN}/api`;
