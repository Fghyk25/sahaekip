import PocketBase from 'pocketbase';

const pbUrl = localStorage.getItem('pocketbase_url') || import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
export const pb = new PocketBase(pbUrl);
