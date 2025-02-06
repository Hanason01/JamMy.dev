import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PostCommentFormData } from "@sharedTypes/types";

const schema = yup.object().shape({
  content: yup
    .string()
    .required("最低1文字が必要です")
    .max(255, "最大255文字までです"),
});

export const usePostCommentValidation = () => {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<PostCommentFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      content: "",
    },
    mode: "onChange"
  });

  return { register, handleSubmit, setError, reset, errors };
};