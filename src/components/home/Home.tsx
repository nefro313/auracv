"use client";

import {
  Button,
  Radio,
  RadioGroup,
  Snippet,
  Tabs,
  Tab,
} from "@nextui-org/react";
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
} from "@/lib/type";
import { supabase } from "@/utils/supabase/client";
import { useCommonContext } from "@/Common_context";
import imageCompression from "browser-image-compression";
import { useNotifications } from "@/components/ui/notification";
import { StudioSkeleton } from "@/components/ui/skeletons";
import Temp1 from "@/components/design/temp_1";
import { useRouter } from "next/navigation";
import { initialUserState } from "@/lib/utils";
import ResumeTemplate from "@/components/design/resume_template";
import { validateImageFile } from "./editor/constants";
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
  const [user, setUser] = useState<UserProfile>(initialUserState);
  const [initialUser, setInitialUser] = useState<UserProfile>(initialUserState);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track unsaved changes
  const [slugError, setSlugError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Already taken!");
  const [isAvailable, setIsAvailable] = useState(false);
  const [userMetaData, setUserMetaData] = useState<any>(null);
  const [githubData, setGithubData] = useState<any>(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const router = useRouter();
  const { notify, viewport: notificationViewport } = useNotifications();

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
          setUserMetaData(data[0].metaJson);
          setGithubData(data[0].githubWrap);
          setUser(JSON.parse(JSON.stringify(data[0].resumeJson))); // Deep clone
          setInitialUser(JSON.parse(JSON.stringify(data[0].resumeJson))); // Deep clone
          setIsLoading(false);
        }
      }
    };
    if (userData?.user.id) {
      fetchUserData();
    }
  }, [userData]);

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

    // Set the upload status to uploading
    setUploadStatus((prevStatus) => ({
      ...prevStatus,
      [`${type}-${index}`]: "uploading",
    }));
    const fileUrl = await uploadImageAndGetUrl(file, path);

    if (fileUrl) {
      console.log("File uploaded successfully:", fileUrl);
      markAsEdited();
      switch (type) {
        case "profilePhoto":
          setUser((prevUser) => ({
            ...prevUser,
            basics: { ...prevUser.basics, avatarUrl: fileUrl },
            meta: { ...prevUser.meta, avatarUrl: fileUrl },
          }));
          setUserMetaData((prevUserMetaData: UserMetaData) => ({
            ...prevUserMetaData,
            avatarUrl: fileUrl,
          }));
          break;
        case "workExperienceLogo":
          setUser((prevUser) => ({
            ...prevUser,
            work: prevUser.work.map((exp, idx) =>
              idx === index ? { ...exp, logo: fileUrl } : exp,
            ),
          }));
          break;
        case "educationLogo":
          setUser((prevUser) => ({
            ...prevUser,
            education: prevUser.education.map((edu, idx) =>
              idx === index ? { ...edu, logo: fileUrl } : edu,
            ),
          }));
          break;
        case "projectImage":
          setUser((prevUser) => ({
            ...prevUser,
            projects: {
              ...prevUser.projects,
              projects: prevUser.projects.projects.map((proj, idx) =>
                idx === index ? { ...proj, image: fileUrl } : proj,
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
                idx === index ? { ...hack, image: fileUrl } : hack,
              ),
            },
          }));
          break;
        default:
          break;
      }

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
      // Handle upload failure
      console.error("File upload failed");

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

  console.log(selectedSection);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (manualScroll.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log("Intersecting:", entry.target.id); // Debugging
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

      // "certificates",
      // "publications",
      "skills",
      "interests",
      "references",
      "languages",
      "volunteer",
      "social-links",
    ];

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      } else {
        console.warn(`Section with id ${id} not found`); // Debugging
      }
    });

    return () => {
      sectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);

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

    // Required fields must be filled before a portfolio can be saved.
    const missingFields: string[] = [];
    if (!user.basics.name?.trim()) missingFields.push("Full name");
    if (!user.meta.userName?.trim()) missingFields.push("User name");
    if (!user.basics.label?.trim()) missingFields.push("Your role");
    if (!user.basics.email?.trim()) missingFields.push("Contact email");

    if (missingFields.length > 0) {
      notify({
        variant: "warning",
        title: "Required fields missing",
        description: `Please fill in: ${missingFields.join(", ")}.`,
      });
      return;
    }

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
        setUser(repairedUser);
        setInitialUser(JSON.parse(JSON.stringify(repairedUser)));
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

  const handleGithubWrap = async (githubUsername: string) => {
    console.log("Generating GitHub Wrap...");
    setGithubLoading(true);
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_BASE_URL + "/githubWrap",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ githubUsername: githubUsername }),
      },
    );
    if (response.ok) {
      console.log("GitHub Wrap generated successfully");
      setGithubLoading(false);
      const data = await response.json();
      setGithubData(data);
      const { data: githubData, error } = await supabase
        .from("users")
        .update({ githubWrap: data })
        .eq("userId", userData?.user.id);
    }
    setGithubLoading(false);
  };

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
      <div className="col-span-1 hidden sm:block border-r border-ink/10 h-full overflow-y-auto px-8 py-12">
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
        className={`col-span-5 sm:col-span-2 sm:block border-r border-ink/10 h-full overflow-y-auto bg-parchment-50 ${
          demo ? "hidden" : "block"
        }`}
      >
        <div className="flex w-full justify-center items-center p-6 border-b border-ink/10 bg-parchment-50/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex gap-2 w-full">
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
        {/* <div className="flex flex-col bg-parchment-100 gap-4 p-4 sm:p-6 border-b">
          {githubData === null ? (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg sm:text-xl font-bold text-left bg-gradient-to-r from-[#2ea043] to-[#238636] text-transparent bg-clip-text">
                GitHub 2024 Wrapped
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  type="text"
                  placeholder="Enter GitHub username"
                  className="w-full px-4 flex-1  py-2 text-sm border border-ink/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-aura-violet/40"
                />
                <button
                  onClick={() => handleGithubWrap(githubUsername)}
                  className="w-full sm:w-auto py-2 flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-[#2ea043] via-[#238636] to-[#1a7f37] text-white font-medium px-4 text-sm rounded-xl hover:from-[#3fb950] hover:via-[#2ea043] hover:to-[#238636] shadow-lg shadow-green-500/20 transition-all duration-300 animate-gradient-x border border-green-600/20"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  {githubLoading ? "Generating..." : "Create GitHub Wrapped"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg sm:text-xl font-bold text-left bg-gradient-to-r from-[#2ea043] to-[#238636] text-transparent bg-clip-text">
                GitHub 2024 Wrapped
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`https://${user.meta.userName}.auracv.me/github`}
                  className="w-full py-2 px-4 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-[#2ea043] to-[#238636] hover:from-[#2c974b] hover:to-[#1f7a31] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
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
                  View 2024 Wrapped
                </Link>
                <Link href={`/download-wrapped`}>
                  <Button className="w-full py-3 px-4 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-[#24292f] to-[#1b1f23] hover:from-[#1b1f23] hover:to-[#121417] transition-all duration-300 flex items-center justify-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Download Wrapped
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div> */}
        <div className="py-6 px-6 border-b block sm:hidden">
          {" "}
          <Snippet
            variant="bordered"
            classNames={{
              base: "rounded-xl border py-[.23rem] ",
              pre: "font-dmSans font-medium",
              symbol: "hidden",
            }}
            className="flex font-dmSans  sm:hidden"
          >
            {`https://${user.meta.userName}.auracv.me`}
          </Snippet>
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
        <div className=" w-full z-50 flex gap-4 bg-parchment-50/85 backdrop-blur-md border-t border-ink/10 p-4 px-10 sticky bottom-0">
          <Link
            target="_blank"
            href={`https://${user.meta.userName}.auracv.me`}
            className="w-full gap-1 rounded-full sm:flex hidden border border-ink/15 font-semibold text-sm justify-center items-center text-ink-soft hover:text-ink hover:border-ink/25 transition-colors bg-white py-2.5"
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
            className="w-full flex sm:hidden rounded-full border border-ink/15 bg-white font-semibold text-sm justify-center items-center text-ink-soft"
          >
            See demo{" "}
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
        className={`col-span-5  sm:col-span-2 sm:block h-full overflow-y-auto bg-parchment-100 ${
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
            <Temp1 user={user} preview />
          </Tab>
          <Tab key="template2" className="p-0" title="Resume">
            <ResumeTemplate profile={user} preview />
          </Tab>
        </Tabs>

        <div className=" w-full z-50 flex gap-4 sm:hidden bg-parchment-50/85 backdrop-blur-md border-t border-ink/10 p-4 px-10 fixed bottom-0">
          <Button
            onPress={() => setDemo(false)}
            className="w-full flex sm:hidden rounded-full border border-ink/15 bg-white font-semibold text-sm justify-center items-center text-ink-soft"
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
