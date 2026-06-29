"use client";

import { ChangeEvent, KeyboardEvent, createContext, useContext } from "react";

import {
  IndexedUploadStatus,
  PhotoTypes,
  UserMetaData,
  UserProfile,
} from "@/lib/type";

type SetUser = React.Dispatch<React.SetStateAction<UserProfile>>;

/**
 * Everything the studio's editing sections need to read and mutate the
 * portfolio being edited. The values are produced once in `Home` and shared
 * through context so each section can live in its own file without prop
 * drilling.
 */
export interface EditorContextValue {
  // Portfolio state
  user: UserProfile;
  setUser: SetUser;
  userMetaData: UserMetaData;
  setUserMetaData: React.Dispatch<React.SetStateAction<UserMetaData>>;

  // Image upload status keyed by `${PhotoType}-${index}`
  uploadStatus: IndexedUploadStatus;

  // Free-text inputs that live outside `user` until committed
  inputValue: string;
  inputValueProject: string;
  setInputValueProject: React.Dispatch<React.SetStateAction<string>>;

  // Username availability
  slugError: boolean;
  setSlugError: React.Dispatch<React.SetStateAction<boolean>>;
  isChecking: boolean;
  isAvailable: boolean;
  setIsAvailable: React.Dispatch<React.SetStateAction<boolean>>;
  errorMessage: string;
  handleBlur: () => Promise<void>;

  // Field + file mutations
  handleInputChange: (
    key: string,
    index: number,
    subKey: string,
    value: string,
  ) => void;
  handleFileUpload: (
    file: File,
    type: PhotoTypes,
    index: number,
  ) => Promise<void>;
  handleRemoveProfilePhoto: () => void;
  deleteItemByIndex: (path: string, index: number, setState: SetUser) => void;
  markAsEdited: () => void;

  // Skills
  handleSkillClose: (skillName: string, skillToRemove: string) => void;
  handleSkillInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSkillInputKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    skillName: string,
  ) => void;

  // Project technologies
  handleTechnologyClose: (projectIndex: number, techToRemove: string) => void;
  handleTechnologyInputKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
    inputValue: string,
  ) => void;

  // Social profiles
  handleSocialProfileChange: (
    network: string,
    value: string,
    setUser: SetUser,
  ) => void;

  // "Add another …" helpers
  addWork: () => void;
  addEducation: () => void;
  addProjects: () => void;
  addHackathons: () => void;
  addAwards: () => void;
  addSkills: () => void;
  addLanguages: () => void;
  addVolunteer: () => void;
  addInterests: () => void;
  addReferences: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({
  value,
  children,
}: {
  value: EditorContextValue;
  children: React.ReactNode;
}) {
  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return ctx;
}
