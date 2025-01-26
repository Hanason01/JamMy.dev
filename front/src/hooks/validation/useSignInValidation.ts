import { LoginFormData } from "@sharedTypes/types";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  email: yup
    .string()
    .required("メールアドレスは必須です"),
  password: yup
    .string()
    .required("パスワードは必須です"),
  remember_me: yup
    .boolean()
    .required(),
});

export const useSignInValidation = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
    mode: "onChange"
  });

  return { register, handleSubmit, setError, errors };
};