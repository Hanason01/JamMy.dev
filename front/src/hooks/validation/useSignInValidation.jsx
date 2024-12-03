import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  email: yup
    .string()
    .required('メールアドレスは必須です'),
  password: yup
    .string()
    .required('パスワードは必須です'),
});

export const useSignInValidation = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      remember_me: false,
    },
    mode: "onChange"
  });

  return { register, handleSubmit, setError, errors };
};