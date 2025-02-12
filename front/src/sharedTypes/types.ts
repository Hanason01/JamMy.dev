//Stateの状態関数用エイリアス
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

//Context関係
import { ReactNode, SetStateAction } from "react";
export interface WithChildren {
  children: ReactNode;
}


//Userオブジェクト
export interface User {
  id: string;
  type: string;
  attributes: UserAttributes;
}

export interface UserAttributes {
  id: number;
  email: string;
  username: string | null;
  nickname: string;
  image: string | null;
  bio: string | null;
  avatar_url: string | null;
}

//Project
// InitialProjectData(一覧、詳細のサーバーアクションベース)
export interface InitialProjectData extends Project {
  user: User;
  audioFilePath?: string;
}

//getProjects
export interface InitialProjectResponse {
  projects: InitialProjectData[];
  meta: Meta;
}

export interface FetchedProjectData extends Project {
  user: User;
  audioFilePath?: string;
  included: IncludedItem[]; // 詳細ページでは `included` をそのまま保持
}

// EnrichedProject 型定義
export interface EnrichedProject extends Project {
  user: User;
  audioFilePath?: string;
  isOwner: boolean;
}

// Project Attributes 型定義
export interface ProjectAttributes {
  id: number;
  title: string;
  description: string;
  duration: number;
  tempo: number;
  status: string;
  visibility: "is_public" | "is_private"; // 公開範囲
  created_at: string;
  updated_at: string;
  like_count: number;
  liked_by_current_user: boolean;
  current_like_id: number | null;
  bookmarked_by_current_user: boolean;
  current_bookmark_id: number | null;
  comment_count: number | null;
}



// Project Relationships 型定義
export interface ProjectRelationships {
  user: {
    data: {
      id: string;
      type: "user";
    };
  };
  audio_file?: {
    data?: {
      id: string;
      type: "audio_file";
    };
  };
}

// Project 型定義
export interface Project {
  id: string;
  type: "project";
  attributes: ProjectAttributes;
  relationships: ProjectRelationships;
}

// Audio File Attributes 型定義
export interface AudioFileAttributes {
  id: number;
  file_path: string;
}

// Audio File 型定義
export interface AudioFile {
  id: string;
  type: "audio_file";
  attributes: AudioFileAttributes;
}


//Collaborations型定義
export interface Collaboration {
  id: number;
  comment?: string;
  user: UserAttributes;
  audioFile: AudioFileAttributes;
}

export interface ExtendedCollaboration extends Collaboration {
  audioBuffer: AudioBuffer;
}

//Notifications型定義
export interface UserSummary {
  id: number;
  nickname?: string;
  username?: string;
  avatar_url?: string;
}

export interface Notifiable {
  id: number;
  project_id?: number;
  project_title?: string;
}

export interface Notification {
  id: number;
  notification_type: "like" | "comment" | "collaboration_request" | "collaboration_approved";
  read: boolean;
  created_at: string;
  recipient: UserSummary;
  sender?: UserSummary;
  notifiable: Notifiable;
  message: string;
}

export interface NotificationResponse {
  notifications: Notification[];
}



// Included 型定義（Union 型で表現）
export type IncludedItem = User | AudioFile | InitialComment;

// API Response 型定義
  //ProjectIndex
export interface ProjectIndexResponse {
  data: Project[];
  included: IncludedItem[];
  meta: Meta;
}

export interface ProjectShowResponse{
  data: Project[];
  included: IncludedItem[];
}

export interface Meta{
  total_pages: number;
}

  // CollaborationManagementIndex
export interface CollaborationManagementIndexResponse {
  data: Project[];
  included: IncludedItem[];
}



//Audio

export type AudioBuffer = globalThis.AudioBuffer | null;

export interface Settings {
  tempo: number;
  duration: number;
  countIn: number;
  metronomeOn: boolean;
}

export interface PostSettings {
  tempo: number;
  duration: number;
}


//Feedback
  export interface Feedback {
    id: number | null;
  }

// Comment Attributes 型定義
export interface CommentAttributes {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  children_count: number;
}


// コメント

// Comment Attributes 型定義
export interface CommentAttributes {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  children_count: number;
}

// Initial Comment Response (APIからの受信日でのコメントデータ)
export interface InitialCommentResponse {
  id: string;
  type: "comment";
  attributes: CommentAttributes;
  relationships: {
    user: {
      data: {
        id: string;
        type: "user";
      };
    };
    children: {
      data: {
        id: string;
        type: "comment";
      }[];
    };
  };
}

// Initial Comment (第一変形型)
export interface InitialComment {
  id: string;
  type: "comment";
  attributes: CommentAttributes;
  user: User;
  replies?: InitialComment[];
}

// Enriched Comment 最終型)
export interface EnrichedComment extends InitialComment {
  isOwner: boolean;
}

// Project Comments APIレスポンス型
export interface ProjectCommentsResponse {
  data: InitialCommentResponse[];
  included: User[];
  meta: {
    total_pages: number;
  };
}

// Project Initial Comments APIレスポンス型
export interface ProjectInitialComments {
  comments: InitialComment[];
  meta: Meta;
}

  // Enriched Comment Collection (最終的に形成されたコメントの集合)
export interface EnrichedCommentCollection {
  comments: EnrichedComment[];
  meta: Meta;
}


//Form
  // PostProjectForm
  export interface PostProjectFormData {
    title: string;
    description: string;
    visibility: "公開" | "限定公開";
    isClosed?: boolean; //オプショナル
  }

  // PostProjectRequest
  export interface PostProjectRequestData {
    "project[title]": string;
    "project[description]": string;
    "project[visibility]": string;
    "project[tempo]": string;
    "project[duration]": string;
    "project[audio_file]": File;
  }

  //EditProjectRequest
  export interface EditProjectRequestData {
    "project[title]": string;
    "project[description]": string;
    "project[visibility]": string;
    "project[status]": string | "null";
    "project[audio_file]": File | "null";
  }

  // PostCollaborationForm
  export interface PostCollaborationFormData {
    comment?: string;
  }

  //PostCollaborationRequest
  export interface PostCollaborationRequestData {
    "collaboration[comment]": string;
    "collaboration[audio_file]": File;
  }

  //CollaborationManagementRequest
  export interface CollaborationManagementRequestData {
    "project[mode]": string;
    "project[audio_file]": File;
    "project[project_id]":string | null;
    "project[collaboration_ids][]": number[];
  }

  //LoginForm
  export interface LoginFormData {
    email: string;
    password: string;
    remember_me: boolean;
  }

  //LoginErrorObject
  export interface SignInError {
    email?: string;
    password?: string;
    general?: string;
  }

  //SignUpForm
  export interface SignUpFormData {
    email: string;
    password: string;
    confirmPassword: string;
    nickname: string;
  }

  //SignUpRequest
  export interface SignUpRequestData {
    email: string;
    nickname: string;
    password: string;
  }

  //SignUpErrorObject
  export interface SignUpError {
    email?: string;
    password?: string;
    nickname?: string;
    general?: string;
  }

  //ResetPassword
  export interface ResetPasswordFormData {
    password: string;
    confirmPassword: string;
  }

  // PostCommentForm
  export interface PostCommentFormData {
    content: string;
  }

  // EditUserFormData
  export interface EditUserFormData {
    nickname: string;
    bio?: string | null;
    avatar?: File | null;
  }

  // EditUserRequest
  export interface EditUserRequestData {
    "project[title]": string;
    "project[description]": string;
    "project[visibility]": string;
    "project[tempo]": string;
    "project[duration]": string;
    "project[audio_file]": File;
  }

//Context用

  // Context 用の型定義
  export interface AuthContextType {
    authenticatedUser: User | null;
    isAuthenticated: boolean;
    showAuthModal: boolean;
    handleLoginSuccess: (user: User) => Promise<void>;
    handleLogout: () => void;
    hasAuthenticated: () => void;
    handleAuthError: () => void;
    openAuthModal: () => void;
    closeAuthModal: () => void;
    signIn: () => boolean;
    requireAuth: () => boolean;
  }

  //Project
  export interface ProjectContextType {
    currentProject: Project | null;
    setCurrentProject: SetState<Project | null>;
    currentUser: User | null;
    setCurrentUser: SetState<User | null>;
    currentAudioFilePath: string | null;
    setCurrentAudioFilePath: SetState<string | null>;
    currentProjectForShow: EnrichedProject | null;
    setCurrentProjectForShow: (project: EnrichedProject | null) => void;
  }

  //CollaborationManagement
  export interface CollaborationManagementContextType {
    postAudioData: AudioBuffer | null;
    setPostAudioData: SetState<AudioBuffer | null>;
    mergedAudioBuffer: AudioBuffer | null;
    setMergedAudioBuffer:SetState<AudioBuffer | null>;
    globalAudioContextRef: React.MutableRefObject<AudioContext | null>;
    enablePostAudioPreview: boolean;
    setEnablePostAudioPreview: SetState<boolean>;
    synthesisList: ExtendedCollaboration[];
    setSynthesisList: SetState<ExtendedCollaboration[]>;
  }

  //ClientCache
  // 直接記述

  //Feedback
  export interface FeedbackContextType {
    feedback: FeedbackState;
    setFeedbackByKey: (key: string) => void;
    setFeedbackAndReload: (key: string) => void;
    clearFeedback: () => void;
  }

  export interface FeedbackState{
    open: boolean;
    message: string;
    severity: FeedbackSeverity;
  }

  export type FeedbackSeverity = "success" | "info" | "warning" | "error";

  export type FeedbackMessages = {
    [key: string]: FeedbackMessages | {
      message: string;
      severity: FeedbackSeverity;
    };
  };

  //utils
  export interface PageKeyResult {
    mutateKey: string;
    projectIndex: number;
    project: EnrichedProject;
  }


  //SWR
  export interface PageData {
    projects: EnrichedProject[];
    meta?: Meta;
  }