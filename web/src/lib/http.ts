import axios, { AxiosError } from 'axios';
import { message, notification } from 'antd';

const baseURL = import.meta.env.VITE_API_BASE as string;

export const http = axios.create({
  baseURL,
  timeout: 15000,
});

http.interceptors.response.use(
  (res) => {
    // 202: Accepted (e.g., file upload accepted and processing)
    if (res.status === 202) {
      message.info('已接收请求，后台处理中…');
    }
    return res;
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const data = error.response?.data as any;
    if (status === 400) {
      message.error(typeof data === 'string' ? data : data?.message ?? '请求无效');
    } else if (status === 404) {
      message.warning('未找到资源');
    } else if (status === 500) {
      notification.error({ message: '服务器错误', description: typeof data === 'string' ? data : data?.message });
    } else {
      notification.error({ message: '网络异常', description: error.message });
    }
    return Promise.reject(error);
  }
);

export async function get<T>(url: string, config?: any) {
  const res = await http.get<T>(url, config);
  return res.data;
}

export async function post<T>(url: string, data?: any, config?: any) {
  const res = await http.post<T>(url, data, config);
  return res.data;
}

export async function del<T>(url: string, config?: any) {
  const res = await http.delete<T>(url, config);
  return res.data;
}

