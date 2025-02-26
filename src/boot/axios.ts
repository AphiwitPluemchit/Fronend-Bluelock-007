import { boot } from 'quasar/wrappers';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // เปลี่ยนเป็น URL ของ API หลังบ้าน
  timeout: 10000, // กำหนด timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
