import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  email: yup
    .string()
    .required('メールアドレスは必須です')
    .email('正しいメールアドレスを入力してください'),
  nickname: yup
    .string()
    .required('ニックネームは必須です')
    .min(1, 'ニックネームは1文字以上で入力してください')
    .max(15, 'ニックネームは15文字以下で入力してください'),
  password: yup
    .string()
    .required('パスワードは必須です')
    .min(8, 'パスワードは8文字以上で入力してください')
    .max(128, 'パスワードは128以下で入力してください')
    .matches(/^[a-zA-Z0-9]*$/, '特殊文字は使用できません'),
  confirmPassword: yup
    .string()
    .required('パスワード確認は必須です')
    .oneOf([yup.ref('password'), null], 'パスワードが一致しません'),
});

export const useSignUpValidation = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange"
  });

  return { register, handleSubmit, setError, errors };
};