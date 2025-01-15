//Stateの状態関数用エイリアス
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

//Context関係
import { ReactNode } from "react";
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
  username: string | null;
  nickname: string;
  image: string | null;
  bio: string | null;
}

//Project
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

// Included 型定義（Union 型で表現）
export type IncludedItem = User | AudioFile;

// API Response 型定義
  //ProjectIndex
export interface ProjectIndexResponse {
  data: Project[];
  included: IncludedItem[];
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



//Form
  // PostProjectForm
  export interface PostProjectFormData {
    title: string;
    description: string;
    visibility: "公開" | "限定公開"; // リテラル型で定義
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

  // PostCollaborationForm
  export interface PostCollaborationFormData {
    comment?: string;
  }

  //PostCollaborationRequest
  export interface PostCollaborationRequestData {
    "collaboration[comment]": string;
    "collaboration[audio_file]": File;
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
    username: string;
  }

  //SignUpRequest
  export interface SignUpRequestData {
    email: string;
    username: string;
    password: string;
  }

  //SignUpErrorObject
  export interface SignUpError {
    email?: string;
    password?: string;
    username?: string;
    general?: string;
  }

//Context用

  // Context 用の型定義
  export interface AuthContextType {
    authenticatedUser: User | null;
    isAuthenticated: boolean;
    showAuthModal: boolean;
    handleLoginSuccess: (user: User) => void;
    handleLogout: () => void;
    hasAuthenticated: () => void;
    handleAuthError: () => void;
    openAuthModal: () => void;
    closeAuthModal: () => void;
  }

  //Project
  export interface ProjectContextType {
    currentProject: Project | null;
    setCurrentProject: SetState<Project | null>;
    currentUser: User | null;
    setCurrentUser: SetState<User | null>;
    currentAudioFilePath: string | null;
    setCurrentAudioFilePath: SetState<string | null>;
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