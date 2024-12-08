import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  title: yup
    .string()
    .min(1, "最低1文字が必要です")
    .max(50, "最大50文字までです")
    .required('タイトルは必須です'),
  description: yup
    .string()
    .min(1, "最低1文字が必要です")
    .max(255, "最大255文字までです")
    .required('概要は必須です'),
});

export const usePostProjectValidation = () => {
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