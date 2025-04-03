import axios from "axios";
import { handleStatusErrors } from "@services/ErrorHandler";
import { Collaboration} from "@sharedTypes/types";

export const collaborationManagementIndexRequest = async (project_id: number, signal:AbortSignal): Promise<Collaboration[]> => {
  if (signal?.aborted) {
    return [];
  }
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/${project_id}/collaboration_managements`, { withCredentials: true, signal }); //signal → アンマウント時の中断シグナル
    const { data, included } = response.data;

    if (data && included) {
      const includedMap = included.reduce((acc: any, item: any) => {
        acc[`${item.type}_${item.id}`] = item.attributes;
        return acc;
      }, {});

      const collaborations = data.map((collaboration: any) => {
        const user = includedMap[`user_${collaboration.relationships.user.data.id}`];
        const audioFile = includedMap[`audio_file_${collaboration.relationships.audio_file.data.id}`];

        return {
          ...collaboration.attributes,
          user,
          audioFile,
        };
      });

      return collaborations;
    } else {
      return [];
    }
  } catch (error: any) {
    if (error.response) {
      handleStatusErrors(error.response.status);
    } else if (error.request) {
      throw new Error("ネットワークエラーが発生しました。");
    } else {
      throw new Error("エラーが発生しました。");
    }
  }
};