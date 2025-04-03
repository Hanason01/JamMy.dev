import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { useAuthContext } from "@context/useAuthContext";

export const useRequest = () => {
  const {handleAuthError, hasAuthenticated} = useAuthContext();

  const request = async<T = any> (
    url: string,
    method = "GET",
    data:any = null,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> => {
    try {
      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API_URL}${url}`,
        method,
        data,
        withCredentials: true,
        ...config,
      });

      if (response.status === 200) {
        hasAuthenticated();
      }

      return response;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        handleAuthError();
      }
      throw error;
    }
  };

  // ショートカットメソッド
  const get = <T = any>(url: string, config: AxiosRequestConfig = {}) => request<T>(url, "GET", null, config);
  const post = <T = any>(url: string, data: any, config: AxiosRequestConfig = {}) => request<T>(url, "POST", data, config);
  const put = <T = any>(url: string, data: any, config: AxiosRequestConfig = {}) => request<T>(url, "PUT", data, config);
  const del = <T = any>(url: string, config = {}) => request<T>(url, "DELETE", null, config);

  return { get, post, put, del };
};