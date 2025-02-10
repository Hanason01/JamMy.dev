import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { EditUserFormData } from "@sharedTypes/types";

const schema = yup.object().shape({
  nickname: yup
    .string()
    .required("ニックネームは必須です")
    .min(1, "最低1文字が必要です")
    .max(15, "最大15文字までです"),
  bio: yup
    .string()
    .max(160, "最大160文字までです")
    .nullable(),
});

export const useEditUserValidation = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: yupResolver(schema),
    mode: "onChange"
  });

  return { register, handleSubmit, setValue, watch, setError, reset, errors };
};