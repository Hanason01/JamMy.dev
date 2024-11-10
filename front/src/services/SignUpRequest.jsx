import axios from 'axios';
import { formatErrorMessage } from "./FormatErrorMessage";

export const signUpRequest = async (data) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth`, data);
    return response.data;
  } catch (error) {
    throw formatErrorMessage(error.response?.data || error.message);
  }
};
