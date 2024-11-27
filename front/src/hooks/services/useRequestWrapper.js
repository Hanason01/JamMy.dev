import axios from 'axios';
import { useAuthContext } from '../../context/useAuthContext';

export const useRequest = () => {
  const {handleAuthError, hasAuthenticated} = useAuthContext();

  // 汎用リクエスト関数
  const request = async (url, method = 'GET', data = null, config = {}) => {
    try {
      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API_URL}${url}`,
        method,
        data,
        withCredentials: true,
        ...config, // その他の追加設定
      });
      // レスポンスが成功し、認証に問題がない場合
      if (response.status === 200) {
        hasAuthenticated();
      }
      return response;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleAuthError(); // 認証エラー処理
      }
      throw error; // エラーを再スロー
    }
  };

  // ショートカットメソッド
  const get = (url, config = {}) => request(url, 'GET', null, config);
  const post = (url, data, config = {}) => request(url, 'POST', data, config);
  const put = (url, data, config = {}) => request(url, 'PUT', data, config);
  const del = (url, config = {}) => request(url, 'DELETE', null, config);

  return { get, post, put, del };
};