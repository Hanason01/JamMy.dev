import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PostCollaborationFormData } from "@sharedTypes/types";

const schema = yup.object().shape({
  comment: yup
    .string()
    .optional()
    .max(255, "最大255文字までです"),
});

export const usePostCollaborationValidation = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PostCollaborationFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      comment: "",
    },
    mode: "onChange"
  });

  return { register, handleSubmit, setError, errors };
};