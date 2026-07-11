"use client";

import {
  Button,
  Radio,
  RadioGroup,
  Snippet,
  Tabs,
  Tab,
  Tooltip,
} from "@nextui-org/react";
import { Undo2, Redo2 } from "lucide-react";
import React, {
  ChangeEvent,
  KeyboardEvent,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import Link from "next/link";
import {
  UserProfile,
  IndexedUploadStatus,
  PhotoTypes,
  reservedWords,
  UserMetaData,
} from "@/lib/user.types";
import { supabase } from "@/utils/supabase/client";
import { useCommonContext } from "@/CommonContext";
import imageCompression from "browser-image-compression";
import { useNotifications } from "@/components/ui/notification";
import { StudioSkeleton } from "@/components/ui/skeletons";
import PortfolioTemplate from "@/components/design/PortfolioTemplate";
import { useRouter } from "next/navigation";
import { initialUserState } from "@/lib/utils";
import ResumeTemplate from "@/components/design/ResumeTemplate";
import { validateImageFile } from "./editor/constants";
import { useUndoableState } from "./editor/useUndoableState";
import {
  StudioDraft,
  clearDraft,
  loadDraft,
  saveDraft,
} from "./editor/draftStorage";
import {
  EditorContextValue,
  EditorProvider,
} from "./editor/EditorContext";
import GeneralInfoSection from "./editor/sections/GeneralInfoSection";
import WorkExperienceSection from "./editor/sections/WorkExperienceSection";
import EducationSection from "./editor/sections/EducationSection";
import ProjectsSection from "./editor/sections/ProjectsSection";
import HackathonsSection from "./editor/sections/HackathonsSection";
import AwardsSection from "./editor/sections/AwardsSection";
import SkillsSection from "./editor/sections/SkillsSection";
import LanguagesSection from "./editor/sections/LanguagesSection";
import VolunteerSection from "./editor/sections/VolunteerSection";
import InterestsSection from "./editor/sections/InterestsSection";
import ReferencesSection from "./editor/sections/ReferencesSection";
import SocialLinksSection from "./editor/sections/SocialLinksSection";

const initialUploadStatus: IndexedUploadStatus = {
  "profilePhoto-0": "idle",
};

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 800,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Error during image compression:", error);
    throw error;
  }
};
const socialMediaImages: { [key: string]: string } = {
  GitHub: "/icon/github.png",
  LinkedIn: "/icon/linkedin.png",
  X: "/icon/twitter.png",
  Youtube: "/icon/youtube.png",
  dribbble: "/icon/dribbble.png",
  default: "/icon/dribbble.png",
};

export default function Home() {
  const { userData } = useCommonContext();

  console.log(userData, "userData");
  const [inputValue, setInputValue] = useState("");
  const [inputValueProject, setInputValueProject] = useState("");
  const [selectedSection, setSelectedSection] = useState("general-info");
  const manualScroll = useRef(false);
  const formScrollRef = useRef<HTMLDivElement>(null);
  const [demo, setDemo] = useState(false);
  const [uploadStatus, setUploadStatus] =
    useState<IndexedUploadStatus>(initialUploadStatus);
  const {
    state: user,
    setState: setUser,
    reset: resetUserHistory,
    undo: undoUser,
    redo: redoUser,
    canUndo,
    canRedo,
  } = useUndoableState<UserProfile>(initialUserState);
  const [initialUser, setInitialUser] = useState<UserProfile>(initialUserState);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track unsaved changes
  // An autosaved draft recovered on load that differs from the server copy. The
  // editor shows the saved (server) version until the user chooses in the prompt
  // whether to restore or discard it; non-null means the prompt is open.
  const [pendingDraft, setPendingDraft] = useState<StudioDraft | null>(null);
  const [slugError, setSlugError] = useState(false);
  // Required General-Info fields that failed validation on the last save
  // attempt — keyed by the `user` path so the section can turn them red.
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Already taken!");
  const [isAvailable, setIsAvailable] = useState(false);
  const [userMetaData, setUserMetaData] = useState<any>(null);
  const router = useRouter();
  const { notify, viewport: notificationViewport } = useNotifications();

  // Apply the recovered draft over the loaded server copy. Restoring via setUser
  // pushes a single undo step, so one Cmd+Z returns to the saved baseline.
  const handleRestoreDraft = useCallback(() => {
    setPendingDraft((draft) => {
      if (!draft) return null;
      setUser(draft.resumeJson);
      if (draft.metaJson) setUserMetaData(draft.metaJson);
      setHasUnsavedChanges(true);
      return null;
    });
  }, [setUser]);

  // Keep the server version and drop the local draft.
  const handleDiscardDraft = useCallback(() => {
    const userId = userData?.user?.id;
    if (userId) clearDraft(userId);
    setPendingDraft(null);
  }, [userData]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("userId", userData?.user.id);

      if (error || data.length === 0) {
        router.push("/create");
        console.error("Error fetching user data:", error);
      } else {
        if (data && data.length > 0) {
          const serverResume: UserProfile = JSON.parse(
            JSON.stringify(data[0].resumeJson),
          );
          const serverMeta: UserMetaData = data[0].metaJson;

          setUserMetaData(serverMeta);
          // Loaded profile is the history baseline — no undo into empty state.
          resetUserHistory(serverResume);
          setInitialUser(JSON.parse(JSON.stringify(serverResume))); // Deep clone

          // Recover unsaved edits from a previous session (reload/crash). Only
          // prompt when the draft actually differs from what's on the server, so
          // an up-to-date user isn't nagged. The editor shows the server copy
          // until the user picks restore/discard in the prompt.
          const draft = loadDraft(userData.user.id);
          if (draft) {
            if (
              JSON.stringify(draft.resumeJson) !== JSON.stringify(serverResume)
            ) {
              setPendingDraft(draft);
            } else {
              // Draft matches the server — nothing to recover, tidy it away.
              clearDraft(userData.user.id);
            }
          }

          setIsLoading(false);
        }
      }
    };
    if (userData?.user.id) {
      fetchUserData();
    }
  }, [userData]);

  // Autosave the in-progress edit to localStorage so a reload or crash doesn't
  // lose unsaved work. Debounced; the draft is cleared on Save and on Discard.
  useEffect(() => {
    const userId = userData?.user?.id;
    if (isLoading || !userId || !hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      saveDraft(userId, {
        resumeJson: user,
        metaJson: userMetaData,
        savedAt: new Date().toISOString(),
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [user, userMetaData, hasUnsavedChanges, isLoading, userData]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Undo / redo for the whole editor. Both keep the doc marked as unsaved.
  const handleUndo = useCallback(() => {
    undoUser();
    setHasUnsavedChanges(true);
  }, [undoUser]);

  const handleRedo = useCallback(() => {
    redoUser();
    setHasUnsavedChanges(true);
  }, [redoUser]);

  // Keyboard: Cmd/Ctrl+Z to undo, Cmd/Ctrl+Shift+Z or Ctrl+Y to redo.
  useEffect(() => {
    if (isLoading) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLoading, handleUndo, handleRedo]);

  const markAsEdited = () => {
    setHasUnsavedChanges(true);
  };

  const handleInputChange = (
    key: string,
    index: number = -1,
    subKey: string = "",
    value: string,
  ) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser };
      const keys = key.split(".");
      let current: any = newUser;

      // Navigate through nested objects
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];

      if (index === -1) {
        // Handle non-array fields
        if (subKey) {
          current[lastKey][subKey] = value;
        } else {
          current[lastKey] = value;
        }
      } else {
        // Handle array fields
        if (!Array.isArray(current[lastKey])) {
          current[lastKey] = [];
        }
        if (!current[lastKey][index]) {
          current[lastKey][index] = {};
        }
        if (subKey === "keywords") {
          // Handle keywords specially - split the string into an array
          current[lastKey][index][subKey] = value
            .split(",")
            .map((k) => k.trim());
        } else if (subKey) {
          current[lastKey][index][subKey] = value;
        } else {
          current[lastKey][index] = value;
        }
      }

      return newUser;
    });

    markAsEdited();
  };

  console.log(user, "user");

  const uploadImageAndGetUrl = async (
    file: File,
    path: string,
  ): Promise<string | null> => {
    try {
      const fileExtension = file.name.split(".").pop();
      if (!fileExtension) {
        throw new Error("File extension not found");
      }

      const filename = `${path}/${file.name.replace(/ /g, "-")}`;
      const compressedFile = await compressImage(file);

      const { data, error } = await supabase.storage
        .from("auracv")
        .upload(filename, compressedFile, {
          upsert: true,
          // Cache aggressively — filenames are unique per upload, so a long TTL
          // lets the browser serve images instantly on repeat views instead of
          // re-fetching and flashing a placeholder each time.
          cacheControl: "31536000",
        });

      if (error) {
        console.error("Upload error:", error);
        return null;
      }

      if (data) {
        const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/auracv/${data.path}`;
        return fileUrl;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error in uploadImageAndGetUrl:", error);
      return null;
    }
  };

  // Write a photo/logo URL into the right slice of `user` for a given section.
  // Shared by the optimistic local preview and the final uploaded URL so both
  // paths stay in sync.
  const setPhotoField = (type: PhotoTypes, index: number, url: string) => {
    switch (type) {
      case "profilePhoto":
        setUser((prevUser) => ({
          ...prevUser,
          basics: { ...prevUser.basics, avatarUrl: url },
          meta: { ...prevUser.meta, avatarUrl: url },
        }));
        setUserMetaData((prevUserMetaData: UserMetaData) => ({
          ...prevUserMetaData,
          avatarUrl: url,
        }));
        break;
      case "workExperienceLogo":
        setUser((prevUser) => ({
          ...prevUser,
          work: prevUser.work.map((exp, idx) =>
            idx === index ? { ...exp, logo: url } : exp,
          ),
        }));
        break;
      case "educationLogo":
        setUser((prevUser) => ({
          ...prevUser,
          education: prevUser.education.map((edu, idx) =>
            idx === index ? { ...edu, logo: url } : edu,
          ),
        }));
        break;
      case "projectImage":
        setUser((prevUser) => ({
          ...prevUser,
          projects: {
            ...prevUser.projects,
            projects: prevUser.projects.projects.map((proj, idx) =>
              idx === index ? { ...proj, image: url } : proj,
            ),
          },
        }));
        break;
      case "hackathonLogo":
        setUser((prevUser) => ({
          ...prevUser,
          hackathons: {
            ...prevUser.hackathons,
            hackathons: prevUser.hackathons.hackathons.map((hack, idx) =>
              idx === index ? { ...hack, image: url } : hack,
            ),
          },
        }));
        break;
      default:
        break;
    }
  };

  // Current photo URL for a section slot, so a failed upload can restore it.
  const getPhotoField = (type: PhotoTypes, index: number): string => {
    switch (type) {
      case "profilePhoto":
        return user.meta.avatarUrl || "";
      case "workExperienceLogo":
        return user.work[index]?.logo || "";
      case "educationLogo":
        return user.education[index]?.logo || "";
      case "projectImage":
        return user.projects.projects[index]?.image || "";
      case "hackathonLogo":
        return user.hackathons.hackathons[index]?.image || "";
      default:
        return "";
    }
  };

  const handleFileUpload = async (
    file: File,
    type: PhotoTypes,
    index: number,
  ) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      notify({
        variant: "error",
        title: "Couldn't upload image",
        description: validationError,
      });
      return;
    }

    const randomNumber = Math.floor(Math.random() * 900) + 100;
    const path = `user/${userData?.user.id}/${type}_${randomNumber}`;

    // Show the selected image immediately from a local object URL so the user
    // sees their photo right away instead of a placeholder/filename while the
    // upload round-trips to storage. Remember the previous value to restore on
    // failure.
    const previousUrl = getPhotoField(type, index);
    const previewUrl = URL.createObjectURL(file);
    setPhotoField(type, index, previewUrl);

    // Set the upload status to uploading
    setUploadStatus((prevStatus) => ({
      ...prevStatus,
      [`${type}-${index}`]: "uploading",
    }));
    const fileUrl = await uploadImageAndGetUrl(file, path);

    if (fileUrl) {
      console.log("File uploaded successfully:", fileUrl);
      markAsEdited();
      // Swap the temporary preview for the persisted storage URL, then release
      // the object URL now that it's no longer referenced.
      setPhotoField(type, index, fileUrl);
      URL.revokeObjectURL(previewUrl);

      // Set the upload status to uploaded
      setUploadStatus((prevStatus) => ({
        ...prevStatus,
        [`${type}-${index}`]: "uploaded",
      }));

      // Reset the upload status to idle after 2 seconds
      setTimeout(() => {
        setUploadStatus((prevStatus) => ({
          ...prevStatus,
          [`${type}-${index}`]: "idle",
        }));
      }, 2000);
    } else {
      // Handle upload failure — restore the previous image and drop the preview.
      console.error("File upload failed");
      setPhotoField(type, index, previousUrl);
      URL.revokeObjectURL(previewUrl);

      // Reset the upload status to idle
      setUploadStatus((prevStatus) => ({
        ...prevStatus,
        [`${type}-${index}`]: "idle",
      }));
    }
  };

  // Clear a previously uploaded photo/logo for any section — mirrors the
  // shape-specific writes in handleFileUpload, but resets the URL to "".
  const handleRemovePhoto = (type: PhotoTypes, index: number) => {
    markAsEdited();
    switch (type) {
      case "profilePhoto":
        setUser((prevUser) => ({
          ...prevUser,
          basics: { ...prevUser.basics, avatarUrl: "" },
          meta: { ...prevUser.meta, avatarUrl: "" },
        }));
        setUserMetaData((prevUserMetaData: UserMetaData) => ({
          ...prevUserMetaData,
          avatarUrl: "",
        }));
        break;
      case "workExperienceLogo":
        setUser((prevUser) => ({
          ...prevUser,
          work: prevUser.work.map((exp, idx) =>
            idx === index ? { ...exp, logo: "" } : exp,
          ),
        }));
        break;
      case "educationLogo":
        setUser((prevUser) => ({
          ...prevUser,
          education: prevUser.education.map((edu, idx) =>
            idx === index ? { ...edu, logo: "" } : edu,
          ),
        }));
        break;
      case "projectImage":
        setUser((prevUser) => ({
          ...prevUser,
          projects: {
            ...prevUser.projects,
            projects: prevUser.projects.projects.map((proj, idx) =>
              idx === index ? { ...proj, image: "" } : proj,
            ),
          },
        }));
        break;
      case "hackathonLogo":
        setUser((prevUser) => ({
          ...prevUser,
          hackathons: {
            ...prevUser.hackathons,
            hackathons: prevUser.hackathons.hackathons.map((hack, idx) =>
              idx === index ? { ...hack, image: "" } : hack,
            ),
          },
        }));
        break;
      default:
        break;
    }

    setUploadStatus((prevStatus) => ({
      ...prevStatus,
      [`${type}-${index}`]: "idle",
    }));
  };

  const handleRemoveProfilePhoto = () => handleRemovePhoto("profilePhoto", 0);

  const handleSkillClose = (skillName: string, skillToRemove: string) => {
    markAsEdited();
    setUser((prevUser) => ({
      ...prevUser,
      basics: {
        ...prevUser.basics,
        skills: prevUser.basics.skills.filter(
          (skill) => skill !== skillToRemove,
        ),
      },
    }));
  };
  const handleSkillInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    markAsEdited();
    setInputValue(event.target.value);
  };

  const handleSkillInputKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    skillName: string,
  ) => {
    if (event.key === "Enter" && skillName.trim() !== "") {
      markAsEdited();
      setUser((prevUser) => ({
        ...prevUser,
        basics: {
          ...prevUser.basics,
          skills: [...prevUser.basics.skills, skillName.trim()],
        },
      }));
      setInputValue(""); // Clear the input after adding
    }
  };

  const handleTechnologyClose = (
    projectIndex: number,
    techToRemove: string,
  ) => {
    console.log(projectIndex, techToRemove);
    markAsEdited();

    setUser((prevUser) => {
      const updatedProjects = [...prevUser.projects.projects]; // Accessing the nested projects array
      const updatedTechnologies = updatedProjects[
        projectIndex
      ].technologies.filter((tech) => tech !== techToRemove);

      updatedProjects[projectIndex] = {
        ...updatedProjects[projectIndex],
        technologies: updatedTechnologies,
      };

      return {
        ...prevUser,
        projects: {
          ...prevUser.projects,
          projects: updatedProjects, // Properly update the nested projects array
        },
      };
    });
  };

  const handleSocialProfileChange = (
    network: string,
    value: string,
    setUser: React.Dispatch<React.SetStateAction<UserProfile>>,
  ) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser };
      const profileIndex = newUser.basics.profiles.findIndex(
        (profile) => profile.network === network,
      );

      if (profileIndex !== -1) {
        // Update existing profile
        newUser.basics.profiles[profileIndex].url = value;
      } else {
        // Add new profile
        newUser.basics.profiles.push({
          network: network,
          url: value,
          username: "",
        });
      }

      return newUser;
    });

    markAsEdited();
  };

  const handleTechnologyInputKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
    inputValue: string,
  ) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      markAsEdited();

      setUser((prevUser) => {
        const updatedProjects = [...prevUser.projects.projects];
        updatedProjects[index] = {
          ...updatedProjects[index],
          technologies: [
            ...updatedProjects[index].technologies,
            inputValue.trim(),
          ],
        };

        return {
          ...prevUser,
          projects: {
            ...prevUser.projects,
            projects: updatedProjects,
          },
        };
      });
      setInputValueProject("");
    }
  };

  // Bullet highlights — an editable string[] on each work / project entry.
  // Immutable updates (mirrors the technologies handlers) so React re-renders.
  type HighlightPath = "work" | "projects.projects";
  const updateHighlights = (
    prev: UserProfile,
    path: HighlightPath,
    itemIndex: number,
    next: (highlights: string[]) => string[],
  ): UserProfile => {
    if (path === "work") {
      const work = [...prev.work];
      work[itemIndex] = {
        ...work[itemIndex],
        highlights: next(work[itemIndex].highlights ?? []),
      };
      return { ...prev, work };
    }
    const projects = [...prev.projects.projects];
    projects[itemIndex] = {
      ...projects[itemIndex],
      highlights: next(projects[itemIndex].highlights ?? []),
    };
    return { ...prev, projects: { ...prev.projects, projects } };
  };

  const handleHighlightChange = (
    path: HighlightPath,
    itemIndex: number,
    highlightIndex: number,
    value: string,
  ) => {
    setUser((prev) =>
      updateHighlights(prev, path, itemIndex, (highlights) => {
        const next = [...highlights];
        next[highlightIndex] = value;
        return next;
      }),
    );
    markAsEdited();
  };

  const addHighlight = (path: HighlightPath, itemIndex: number) => {
    setUser((prev) =>
      updateHighlights(prev, path, itemIndex, (highlights) => [
        ...highlights,
        "",
      ]),
    );
    markAsEdited();
  };

  const removeHighlight = (
    path: HighlightPath,
    itemIndex: number,
    highlightIndex: number,
  ) => {
    setUser((prev) =>
      updateHighlights(prev, path, itemIndex, (highlights) =>
        highlights.filter((_, i) => i !== highlightIndex),
      ),
    );
    markAsEdited();
  };

  const [file, setFile] = useState<File | null>(null);

  // Paths must match the actual UserProfile shape (dot-paths for nested arrays).
  type DeleteType =
    | "work"
    | "hackathons.hackathons"
    | "education"
    | "projects.projects";

  const deleteItemByIndex = (
    path: string,
    index: number,
    setState: React.Dispatch<React.SetStateAction<UserProfile>>,
  ) => {
    setState((prevUser) => {
      const newUser = { ...prevUser };
      const keys = path.split(".");
      let current: any = newUser;

      // Navigate to the parent of the target array
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          console.error(`Invalid path: ${path}`);
          return prevUser;
        }
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];

      if (Array.isArray(current[lastKey])) {
        current[lastKey] = current[lastKey].filter(
          (_: any, i: number) => i !== index,
        );
      } else {
        console.error(`${lastKey} is not an array`);
        return prevUser;
      }

      return newUser;
    });

    markAsEdited();
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  useEffect(() => {
    // The editor form (and its section anchors) only mount once the profile has
    // loaded. Skip until then so the scroll-spy attaches to real nodes instead
    // of warning about ids that don't exist yet.
    if (isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (manualScroll.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSelectedSection(entry.target.id);
          }
        });
      },
      { root: formScrollRef.current, threshold: 0.3 },
    );

    const sectionIds = [
      "general-info",
      "work-experience",
      "education",
      "project",
      "hackathon",
      "awards",
      "skills",
      "interests",
      "references",
      "languages",
      "volunteer",
      "social-links",
    ];

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [isLoading]);

  const handleRadioChange = (event: any) => {
    const value = event.target.value;
    setSelectedSection(value);
    const section = document.getElementById(value);
    if (section) {
      manualScroll.current = true;
      section.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        manualScroll.current = false;
      }, 1000); // Adjust the timeout based on scroll duration
    }
  };
  type AddItemFunction = () => void;

  const createAddItemFunctions = (): Record<string, AddItemFunction> => {
    const itemTemplates = {
      work: {
        summary: "",
        website: "",
        name: "",
        location: "",
        position: "",
        startDate: "",
        endDate: "",
        logo: "",
        highlights: [],
      },
      education: {
        endDate: "",
        startDate: "",
        area: "",
        studyType: "",
        summary: "",
        institution: "",
        url: "",
        logo: "",
        score: "",
        courses: [""],
      },

      // certificates: {
      //   name: "",
      //   date: "",
      //   issuer: "",
      //   url: "",
      // },
      skills: {
        name: "",
        keywords: [], // Initialize as empty array
      },
      awards: {
        title: "",
        awarder: "",
        date: "",
        summary: "",
      },
      // publications: {
      //   name: "",
      //   publisher: "",
      //   releaseDate: "",
      //   url: "",
      //   summary: "",
      // },
      volunteer: {
        organization: "",
        position: "",
        url: "",
        startDate: "",
        summary: "",
        highlights: [""],
      },
      languages: {
        language: "",
        fluency: "",
      },
      interests: {
        name: "",
        keywords: [""],
      },
      references: {
        reference: "",
        name: "",
      },
    };

    return Object.entries(itemTemplates).reduce(
      (acc, [key, template]) => {
        acc[`add${key.charAt(0).toUpperCase() + key.slice(1)}`] = () => {
          addItemToArray(key, template, setUser);
        };
        return acc;
      },
      {} as Record<string, AddItemFunction>,
    );
  };

  const {
    addWork,
    addEducation,
    // addCertificates,
    addSkills,
    addAwards,
    // addPublications,
    addVolunteer,
    addLanguages,
    addInterests,
    addReferences,
  } = createAddItemFunctions();

  const addItemToArray = (
    path: string,
    newItem: any,
    setUser: React.Dispatch<React.SetStateAction<UserProfile>>,
  ) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser };
      const keys = path.split(".");
      let current: any = newUser;

      // Navigate to the parent of the target array
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];

      if (Array.isArray(current[lastKey])) {
        current[lastKey] = [...current[lastKey], newItem];
      } else if (
        typeof current[lastKey] === "object" &&
        current[lastKey] !== null
      ) {
        // Handle nested objects like projects and hackathons
        if (!Array.isArray(current[lastKey][lastKey])) {
          current[lastKey][lastKey] = [];
        }
        current[lastKey][lastKey] = [...current[lastKey][lastKey], newItem];
      } else {
        console.error(`${lastKey} is not an array or a valid object`);
        return prevUser;
      }

      return newUser;
    });

    markAsEdited();
  };

  // ... existing code ...

  const addProjects = () => {
    setUser((prevUser) => {
      const newProject = {
        title: "",
        description: "",
        website: "",
        duration: "",
        technologies: [],
        highlights: [],
        image: "",
        source: "",
      };
      return {
        ...prevUser,
        projects: {
          ...prevUser.projects,
          projects: [...prevUser.projects.projects, newProject],
        },
      };
    });
    markAsEdited();
  };

  const addHackathons = () => {
    setUser((prevUser) => {
      const newHackathon = {
        title: "",
        dates: "",
        location: "",
        description: "",
        image: "",
        win: "",
        url: "",
      };
      return {
        ...prevUser,
        hackathons: {
          ...prevUser.hackathons,
          hackathons: [...prevUser.hackathons.hackathons, newHackathon],
        },
      };
    });
    markAsEdited();
  };

  // ... rest of the existing code ...

  const handleSaveChanges = async () => {
    console.log("Saving changes...");

    // Required fields must be filled before a portfolio can be saved. Track
    // both a human label (for the toast) and the field key (to turn the
    // matching input red in the General Info section).
    const requiredFields: { key: string; label: string; empty: boolean }[] = [
      { key: "basics.name", label: "Full name", empty: !user.basics.name?.trim() },
      { key: "meta.userName", label: "User name", empty: !user.meta.userName?.trim() },
      { key: "basics.label", label: "Your role", empty: !user.basics.label?.trim() },
      { key: "basics.email", label: "Contact email", empty: !user.basics.email?.trim() },
    ];
    const missing = requiredFields.filter((f) => f.empty);

    if (missing.length > 0) {
      setFieldErrors(
        Object.fromEntries(missing.map((f) => [f.key, true])),
      );
      notify({
        variant: "warning",
        title: "Required fields missing",
        description: `Please fill in: ${missing
          .map((f) => f.label)
          .join(", ")}.`,
      });
      // Bring the first empty required field into view so it's obvious which
      // one needs attention.
      setSelectedSection("general-info");
      document
        .getElementById("general-info")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // All required fields present — clear any leftover red state.
    setFieldErrors({});

    // Block saving when the chosen username is taken / reserved.
    if (slugError) {
      notify({
        variant: "error",
        title: "Username unavailable",
        description:
          "That user name is already taken. Pick another one before saving.",
      });
      return;
    }

    let userUpdateSuccess = true;

    if (Object.keys(user).length > 0) {
      // Usernames must stay subdomain-safe (lowercase letters, digits,
      // hyphens). Fall back to metaJson's copy if resumeJson.meta lost it,
      // and never overwrite the username with an empty value.
      const sanitizedUserName = (
        user.meta.userName ||
        userMetaData?.userName ||
        ""
      )
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");

      const repairedUser = sanitizedUserName
        ? { ...user, meta: { ...user.meta, userName: sanitizedUserName } }
        : user;

      const updatePayload: Record<string, unknown> = {
        resumeJson: repairedUser,
        metaJson: userMetaData,
        updatedAt: new Date().toISOString(),
      };
      if (sanitizedUserName) {
        updatePayload.userName = sanitizedUserName;
      }

      const { data, error } = await supabase
        .from("users")
        .update(updatePayload)
        .eq("userId", userData?.user.id)
        .select();

      if (error) {
        console.error("Error updating user data:", error);
        userUpdateSuccess = false;
        notify({
          variant: "error",
          title: "Error saving changes",
          description: error.message,
        });
      } else {
        setHasUnsavedChanges(false);
        // Saved state becomes the new history baseline.
        resetUserHistory(repairedUser);
        setInitialUser(JSON.parse(JSON.stringify(repairedUser)));
        // The server copy is now current — drop the local draft so it can't be
        // re-restored on the next reload.
        if (userData?.user?.id) clearDraft(userData.user.id);
        notify({
          variant: "success",
          title: "Changes saved successfully!",
          description: (
            <Link
              target="_blank"
              href={`https://${user.meta.userName}.auracv.me`}
              className="mt-1 inline-block rounded-lg bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              Visit your auracv ↗
            </Link>
          ),
        });
        console.log("User data updated successfully:", data);
      }
    }

    if (userUpdateSuccess) {
      console.log("All changes saved successfully");
    } else {
      console.log("Some changes failed to save");
    }
  };;

  const checkSlugUnique = async (slug: string): Promise<boolean> => {
    if (slug === initialUser.meta.userName) {
      return true;
    }
    if (reservedWords.includes(slug.toLowerCase())) {
      return false;
    }

    // Exclude the signed-in user's own row, so their current username
    // is never reported as "already taken".
    const { data, error } = await supabase
      .from("users")
      .select("userName")
      .eq("userName", slug)
      .neq("userId", userData?.user.id);

    if (error) {
      console.error("Error checking slug:", error);
      return false;
    }

    return data.length === 0;
  };

  const handleBlur = async () => {
    if (user.meta.userName === "") {
      setIsAvailable(false);
      setSlugError(false);
      notify({
        variant: "warning",
        title: "User name required",
        description: "Choose a user name for your portfolio URL.",
      });
      return;
    }

    setIsChecking(true);
    const isUnique = await checkSlugUnique(user.meta.userName);
    setIsChecking(false);

    setIsAvailable(isUnique);
    setSlugError(!isUnique);

    if (isUnique) {
      // Don't re-announce the user's own unchanged username.
      if (user.meta.userName !== initialUser.meta.userName) {
        notify({
          variant: "success",
          title: "User name available",
          description: `${user.meta.userName}.auracv.me is all yours.`,
        });
      }
    } else {
      notify({
        variant: "error",
        title: "User name taken",
        description: `${user.meta.userName}.auracv.me is unavailable. Try another.`,
      });
    }
  };

  if (isLoading) {
    return <StudioSkeleton />;
  }

  const sections = [
    { id: "general-info", label: "General Info" },
    { id: "work-experience", label: "Work Experience" },
    { id: "education", label: "Education" },
    { id: "project", label: "Projects" },
    { id: "hackathon", label: "Hackathons" },
    { id: "awards", label: "Awards" },
    // { id: "certificates", label: "Certificates" },
    // { id: "publications", label: "Publications" },
    { id: "skills", label: "Skills" },
    { id: "languages", label: "Languages" },
    { id: "volunteer", label: "Volunteer" },
    { id: "interests", label: "Interests" },
    { id: "references", label: "References" },
    { id: "social-links", label: "Social Links" },
  ];

  const RadioLink = ({
    id,
    label,
    isLast,
  }: {
    id: string;
    label: string;
    isLast: boolean;
  }) => (
    <Link href={`#${id}`}>
      <Radio
        className={`p-0 -ml-2.5 ${!isLast ? "mb-6" : ""}`}
        value={id}
        size="md"
      >
        {label}
      </Radio>
    </Link>
  );

  const editorValue: EditorContextValue = {
    user,
    setUser,
    userMetaData,
    setUserMetaData,
    uploadStatus,
    inputValue,
    inputValueProject,
    setInputValueProject,
    slugError,
    setSlugError,
    fieldErrors,
    setFieldErrors,
    isChecking,
    isAvailable,
    setIsAvailable,
    errorMessage,
    handleBlur,
    handleInputChange,
    handleFileUpload,
    handleRemoveProfilePhoto,
    handleRemovePhoto,
    deleteItemByIndex,
    markAsEdited,
    handleSkillClose,
    handleSkillInputChange,
    handleSkillInputKeyDown,
    handleTechnologyClose,
    handleTechnologyInputKeyDown,
    handleHighlightChange,
    addHighlight,
    removeHighlight,
    handleSocialProfileChange,
    addWork,
    addEducation,
    addProjects,
    addHackathons,
    addAwards,
    addSkills,
    addLanguages,
    addVolunteer,
    addInterests,
    addReferences,
  };

  return (
    <EditorProvider value={editorValue}>
      <div className="grid grid-cols-5 font-outfit w-full h-full overflow-hidden bg-parchment-100 text-ink">
        {notificationViewport}

        {/* ---------- Recover unsaved changes prompt ---------- */}
        {pendingDraft && (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="restore-draft-title"
          >
            {/* Non-dismissing backdrop — the user must explicitly choose so
                recovered work is never lost by an accidental outside click. */}
            <div
              aria-hidden
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            <div className="animate-fade-up relative z-10 w-full max-w-md rounded-3xl border border-ink/10 bg-parchment-50 p-7 shadow-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aura-violet/10 text-aura-violet">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.6}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
              </div>
              <h2
                id="restore-draft-title"
                className="mt-4 font-fraunces text-2xl font-medium tracking-tight text-ink"
              >
                Recover unsaved changes?
              </h2>
              <p className="mt-2 text-sm font-medium text-ink-soft">
                We found edits you made last time that were never saved. Would
                you like to restore them, or start from your last saved version?
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={handleDiscardDraft}
                  className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-white/70 px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink"
                >
                  Discard
                </button>
                <button
                  onClick={handleRestoreDraft}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-parchment-50 transition hover:shadow-[0_0_28px_-6px_rgba(139,92,246,0.65)]"
                >
                  Restore changes
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="col-span-1 hidden lg:block border-r border-ink/10 h-full overflow-y-auto px-8 py-12">
          <div>
            <p className="mb-6 pl-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-ink-mute">
              Sections
            </p>
            <RadioGroup
              color="secondary"
              className="font-medium text-ink-mute"
              defaultValue="general-info"
              value={selectedSection}
              onChange={handleRadioChange}
            >
              {sections.map((section, index) => (
                <RadioLink
                  key={`radio-${index}`}
                  id={section.id}
                  label={section.label}
                  isLast={index === sections.length - 1}
                />
              ))}
            </RadioGroup>
          </div>
        </div>
        <div
          ref={formScrollRef}
          className={`col-span-5 lg:col-span-2 lg:block border-r border-ink/10 h-full overflow-y-auto bg-parchment-50 ${
            demo ? "hidden" : "block"
          }`}
        >
          <div className="flex w-full justify-center items-center p-6 border-b border-ink/10 bg-parchment-50/80 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex flex-col gap-2 w-full lg:flex-row lg:items-center">
              <div className="hidden lg:flex gap-2 shrink-0">
                <Tooltip content="Undo (⌘Z)" delay={400} closeDelay={0}>
                  <Button
                    isIconOnly
                    aria-label="Undo"
                    onPress={handleUndo}
                    isDisabled={!canUndo}
                    className="h-11 w-11 min-w-11 shrink-0 rounded-full border border-ink/15 bg-white text-ink-soft data-[hover=true]:text-ink data-[hover=true]:border-ink/25"
                  >
                    <Undo2 className="size-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Redo (⌘⇧Z)" delay={400} closeDelay={0}>
                  <Button
                    isIconOnly
                    aria-label="Redo"
                    onPress={handleRedo}
                    isDisabled={!canRedo}
                    className="h-11 w-11 min-w-11 shrink-0 rounded-full border border-ink/15 bg-white text-ink-soft data-[hover=true]:text-ink data-[hover=true]:border-ink/25"
                  >
                    <Redo2 className="size-4" />
                  </Button>
                </Tooltip>
              </div>
              <div className="flex gap-2 w-full lg:flex-1">
                <Link
                  target="_blank"
                  className="flex-1 bg-white text-ink-soft font-semibold px-4 py-2.5 text-sm justify-center items-center flex rounded-full cursor-pointer hover:border-ink/25 hover:text-ink transition-colors duration-200 border border-ink/15 text-center"
                  href={`https://${user.meta.userName}.auracv.me`}
                >
                  View Portfolio
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4 ml-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                    />
                  </svg>
                </Link>
                <Link
                  target="_blank"
                  className="flex-1 bg-white text-ink-soft font-semibold px-4 py-2.5 text-sm justify-center items-center flex rounded-full cursor-pointer hover:border-ink/25 hover:text-ink transition-colors duration-200 border border-ink/15 text-center"
                  href={`https://${user.meta.userName}.auracv.me/resume`}
                >
                  View Resume
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4 ml-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="py-6 px-6 border-b block lg:hidden">
            <div className="flex items-center gap-2">
              <Snippet
                variant="bordered"
                classNames={{
                  base: "min-w-0 flex-1 rounded-xl border py-[.23rem]",
                  pre: "font-dmSans font-medium truncate",
                  symbol: "hidden",
                }}
                className="flex min-w-0 flex-1 font-dmSans"
              >
                {`${user.meta.userName}.auracv.me`}
              </Snippet>
              <Tooltip content="Undo (⌘Z)" delay={400} closeDelay={0}>
                <Button
                  isIconOnly
                  aria-label="Undo"
                  onPress={handleUndo}
                  isDisabled={!canUndo}
                  className="h-11 w-11 min-w-11 shrink-0 rounded-full border border-ink/15 bg-white text-ink-soft data-[hover=true]:text-ink data-[hover=true]:border-ink/25"
                >
                  <Undo2 className="size-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Redo (⌘⇧Z)" delay={400} closeDelay={0}>
                <Button
                  isIconOnly
                  aria-label="Redo"
                  onPress={handleRedo}
                  isDisabled={!canRedo}
                  className="h-11 w-11 min-w-11 shrink-0 rounded-full border border-ink/15 bg-white text-ink-soft data-[hover=true]:text-ink data-[hover=true]:border-ink/25"
                >
                  <Redo2 className="size-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
          <div className="px-8">
            <GeneralInfoSection />
            <WorkExperienceSection />
            <EducationSection />
            <ProjectsSection />
            <HackathonsSection />
            {/* Awards Section */}
            <AwardsSection />
            {/* Certificates Section */}
            {/* <div
            id="certificates"
            className="flex flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">Certificates</h2>
            {user.certificates &&
              user.certificates.length > 0 &&
              user.certificates.map((certificate, index) => (
                <div
                  key={index}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() =>
                        deleteItemByIndex("certificates", index, setUser)
                      }
                      aria-label={`Delete certificate ${index}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6 text-red-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Certificate Name</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={certificate.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "certificates",
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Issuer</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={certificate.issuer}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "certificates",
                          index,
                          "issuer",
                          e.target.value
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Date</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={certificate.date}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "certificates",
                          index,
                          "date",
                          e.target.value
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">URL</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={certificate.url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "certificates",
                          index,
                          "url",
                          e.target.value
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                </div>
              ))}
            <Button
              variant="bordered"
              onPress={addCertificates}
              className="border border-dashed border-ink/25 bg-none rounded-full flex justify-center items-center gap-1 text-sm font-semibold text-ink-soft hover:border-aura-violet/50 hover:text-ink transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5 text-ink-soft"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Certificate
            </Button>
          </div> */}
            {/* Skills Section */}
            <SkillsSection />
            {/* Publications Section */}
            {/* <div
            id="publications"
            className="flex flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">Publications</h2>
            {user.publications &&
              user.publications.length > 0 &&
              user.publications.map((publication, index) => (
                <div
                  key={index}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() =>
                        deleteItemByIndex("publications", index, setUser)
                      }
                      aria-label={`Delete publication ${index}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6 text-red-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Publication Name</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={publication.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "publications",
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Publisher</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={publication.publisher}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "publications",
                          index,
                          "publisher",
                          e.target.value
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Release Date</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={publication.releaseDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "publications",
                          index,
                          "releaseDate",
                          e.target.value
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">URL</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={publication.url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "publications",
                          index,
                          "url",
                          e.target.value
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Summary</p>
                    <Textarea
                      variant="bordered"
                      value={publication.summary}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "publications",
                          index,
                          "summary",
                          e.target.value
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                </div>
              ))}
            <Button
              variant="bordered"
              onPress={addPublications}
              className="border border-dashed border-ink/25 bg-none rounded-full flex justify-center items-center gap-1 text-sm font-semibold text-ink-soft hover:border-aura-violet/50 hover:text-ink transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5 text-ink-soft"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Publication
            </Button>
          </div> */}
            {/* Languages Section */}
            <LanguagesSection />
            {/* Volunteer Section */}
            <VolunteerSection />
            {/* Interests Section */}
            <InterestsSection />
            {/* References Section */}
            <ReferencesSection />
            <SocialLinksSection />
          </div>
          <div className=" w-full z-50 flex gap-4 bg-parchment-50/85 backdrop-blur-md border-t border-ink/10 p-4 px-6 sm:px-10 sticky bottom-0">
            <Link
              target="_blank"
              href={`https://${user.meta.userName}.auracv.me`}
              className="w-full gap-1 rounded-full lg:flex hidden border border-ink/15 font-semibold text-sm justify-center items-center text-ink-soft hover:text-ink hover:border-ink/25 transition-colors bg-white py-2.5"
            >
              View live
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 text-ink-soft"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                />
              </svg>
            </Link>
            <Button
              onPress={() => setDemo(true)}
              className="w-full flex lg:hidden gap-1.5 rounded-full border border-ink/15 bg-white font-semibold text-sm justify-center items-center text-ink-soft"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 text-ink-soft"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
              Preview
            </Button>
            <Button
              onPress={handleSaveChanges}
              className="bg-ink w-full text-parchment-50 text-sm justify-center flex items-center rounded-full font-semibold py-2 px-4 transition-shadow duration-300 hover:shadow-[0_0_28px_-6px_rgba(139,92,246,0.65)]"
            >
              Save changes
            </Button>
          </div>
        </div>
        <div
          className={`col-span-5  lg:col-span-2 lg:block h-full overflow-y-auto bg-parchment-100 ${
            demo ? "block" : "hidden"
          }`}
        >
          <Tabs
            color="secondary"
            aria-label="Template Options"
            className="w-full p-6 border-b border-ink/10 bg-parchment-50/80 backdrop-blur-sm sticky top-0 z-30"
            fullWidth
          >
            <Tab key="template1" className="p-0" title="Portfolio">
              <PortfolioTemplate user={user} preview />
            </Tab>
            <Tab key="template2" className="p-0" title="Resume">
              <ResumeTemplate profile={user} preview />
            </Tab>
          </Tabs>

          <div className=" w-full z-50 flex gap-4 lg:hidden bg-parchment-50/85 backdrop-blur-md border-t border-ink/10 p-4 px-6 sm:px-10 sticky bottom-0">
            <Button
              onPress={() => setDemo(false)}
              className="w-full flex lg:hidden rounded-full border border-ink/15 bg-white font-semibold text-sm justify-center items-center text-ink-soft"
            >
              Back to Edit
            </Button>
            <Button className="bg-ink w-full text-parchment-50 text-sm justify-center flex items-center rounded-full font-semibold py-2 px-4 ">
              Save changes{" "}
            </Button>
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}
