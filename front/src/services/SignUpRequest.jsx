import axios from 'axios';

export const signUpRequest = async (data) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth`, data);
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
      if (error.response.data.errors.username) {
        formattedErrors.username = error.response.data.errors.username[0];
      }
    } else {
      formattedErrors.general = "エラーが発生しました。再度お試しください。";
    }
    throw formattedErrors;
  }
};
