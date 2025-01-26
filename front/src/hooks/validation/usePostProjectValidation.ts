import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PostProjectFormData } from "@sharedTypes/types";

const schema = yup.object().shape({
  title: yup
    .string()
    .required("タイトルは必須です")
    .min(1, "最低1文字が必要です")
    .max(50, "最大50文字までです"),
  description: yup
    .string()
    .required("概要は必須です")
    .min(1, "最低1文字が必要です")
    .max(255, "最大255文字までです"),
  visibility: yup
    .mixed<"公開" | "限定公開">()
    .required("公開範囲は必須です")
    .oneOf(["公開", "限定公開"], "無効な公開範囲です"),
});

export const usePostProjectValidation = (initialValues?: PostProjectFormData) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PostProjectFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      visibility: initialValues?.visibility || "公開",
      isClosed: false,
    },
    mode: "onChange"
  });

  return { register, handleSubmit, setError, errors };
};