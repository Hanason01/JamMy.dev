import axios from 'axios';

export const signInRequest = async (data) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign_in`, data);
    return response.data;
  } catch (error) {
    const formattedErrors = {};

    if (error.response?.data?.errors) {
      if (error.response.data.errors.email) {
        formattedErrors.email = error.response.data.errors.email[0];
      }
      if (error.response.data.errors.password) {
        formattedErrors.password = error.response.data.errors.password[0];
      }
    } else {
      formattedErrors.general = "エラーが発生しました。再度お試しください。";
    }
    throw formattedErrors;
  }
};
