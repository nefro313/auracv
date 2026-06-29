"use client";

import {
  Button,
  Chip,
  DateRangePicker,
  Input,
  Kbd,
  Radio,
  RadioGroup,
  Snippet,
  Spinner,
  Textarea,
  Tabs,
  Tab,
  Select,
  SelectItem,
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
import { cn } from "@/lib/utils";
import { useCommonContext } from "@/Common_context";
import imageCompression from "browser-image-compression";
import { useNotifications } from "@/components/ui/notification";
import Temp1 from "@/components/design/temp_1";
import { useRouter } from "next/navigation";
import { tailwindColors } from "@/lib/utils";
import { initialUserState } from "@/lib/utils";
import ResumeTemplate from "../ResumeTemplate";

const initialUploadStatus: IndexedUploadStatus = {
  "profilePhoto-0": "idle",
};

// Image upload constraints. Raster image formats are accepted up to the size
// cap below; SVG and WebP are explicitly rejected.
const MAX_IMAGE_SIZE_MB = 5;
const ACCEPTED_IMAGE_INPUT = "image/png,image/jpeg,image/jpg,image/gif,image/bmp";
const BLOCKED_IMAGE_TYPES = ["image/svg+xml", "image/webp"];
const BLOCKED_IMAGE_EXTENSIONS = ["svg", "webp"];

// Returns an error message when the file is not an acceptable image, else null.
const validateImageFile = (file: File | undefined | null): string | null => {
  if (!file) return "No file was selected.";

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isImage = file.type.startsWith("image/");

  if (
    !isImage ||
    BLOCKED_IMAGE_TYPES.includes(file.type) ||
    BLOCKED_IMAGE_EXTENSIONS.includes(extension)
  ) {
    return "Unsupported format. Use PNG, JPG, JPEG, GIF or BMP — SVG and WebP aren't allowed.";
  }

  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `Image is too large (${sizeMb}MB). Maximum allowed size is ${MAX_IMAGE_SIZE_MB}MB.`;
  }

  return null;
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
  const [isLoading, setIsLoading] = useState(false);
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

  const handleRemoveProfilePhoto = () => {
    markAsEdited();
    setUser((prevUser) => ({
      ...prevUser,
      basics: { ...prevUser.basics, avatarUrl: "" },
      meta: { ...prevUser.meta, avatarUrl: "" },
    }));
    setUserMetaData((prevUserMetaData: UserMetaData) => ({
      ...prevUserMetaData,
      avatarUrl: "",
    }));
    setUploadStatus((prevStatus) => ({
      ...prevStatus,
      "profilePhoto-0": "idle",
    }));
  };

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
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Spinner color="default" />
      </div>
    );
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

  return (
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
          <div
            id="general-info"
            className="flex flex-col pt-6 sm:pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              General Info
            </h2>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Profile Photo</p>
              <div className="flex max-w-xs w-full justify-start  gap-2 items-center flex-row flex-wrap">
                {user.meta.avatarUrl ? (
                  <div className="relative w-12 h-12 sm:h-12 sm:w-12 group/photo">
                    <img
                      src={user.meta.avatarUrl}
                      className="w-12 h-12 sm:h-12 sm:w-12 rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveProfilePhoto}
                      aria-label="Remove profile photo"
                      className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-white border border-ink/15 text-red-400 shadow-sm hover:bg-red-50 hover:border-red-300 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center  bg-parchment-200 rounded-xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6 text-ink-mute"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                  </div>
                )}

                <label className=" flex flex-row gap-2 text-ink-mute cursor-pointer shadow-xs justify-center items-center  flex-1 px-3 h-12 rounded-xl border-dashed border border-ink/25 bg-parchment-100/50 hover:border-aura-violet/50 hover:bg-white hover:text-ink transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4 text-ink-mute"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  {uploadStatus["profilePhoto-0"] === "idle" &&
                    "Upload profile image"}
                  {uploadStatus["profilePhoto-0"] === "uploading" &&
                    "Uploading..."}
                  {uploadStatus["profilePhoto-0"] === "uploaded" &&
                    "Profile image uploaded"}
                  <input
                    onChange={(event) => {
                      // setIsError(false);
                      if (event.target.files) {
                        handleFileUpload(
                          event.target.files[0],
                          "profilePhoto",
                          0,
                        );
                      }
                    }}
                    type="file"
                    accept={ACCEPTED_IMAGE_INPUT}
                    className="  w-full hidden  font-body font-light text-ink/80 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-parchment-300 file:text-ink-soft hover:file:bg-ink-mute"
                  />
                </label>
              </div>
            </div>{" "}
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Full Name</p>
              <Input
                type="text"
                variant="bordered"
                value={user.basics.name}
                onChange={(e) =>
                  handleInputChange("basics.name", -1, "", e.target.value)
                }
                name="basics.name"
                className="max-w-xs text-ink-soft"
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>{" "}
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Username</p>
              <Input
                type="text"
                variant="bordered"
                value={user.meta.userName}
                onChange={(e) => {
                  // Clear any stale availability state while the user edits.
                  setSlugError(false);
                  setIsAvailable(false);
                  setUserMetaData((prevUserMetaData: UserMetaData) => ({
                    ...prevUserMetaData,
                    userName: e.target.value.toLowerCase().replace(/\s+/g, ""),
                  }));
                  handleInputChange(
                    "meta.userName",
                    -1,
                    "",
                    e.target.value.toLowerCase().replace(/\s+/g, ""),
                  );
                }}
                name="userName"
                isInvalid={slugError}
                errorMessage={errorMessage}
                onBlur={handleBlur}
                className="max-w-xs flex  text-ink-soft"
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
                endContent={
                  <div className="pointer-events-none pl-2 w-full  gap-7 flex items-between">
                    <span className="text-default-600 font-semibold text-sm">
                      .auracv.me
                    </span>
                    {isChecking ? (
                      <Spinner size="sm" color="default" className="size-6" />
                    ) : (
                      isAvailable && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6 text-aura-cyan"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      )
                    )}
                  </div>
                }
                pattern="[^ ]+" // Pattern to disallow spaces
                title="Spaces are not allowed" // Title to show when invalid
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Your Role</p>
              <Input
                type="text"
                variant="bordered"
                defaultValue="Product designer"
                value={user.basics.label}
                onChange={(e) =>
                  handleInputChange("basics.label", -1, "", e.target.value)
                }
                name="role"
                className="max-w-xs text-ink-soft"
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">About</p>
              <Textarea
                variant="bordered"
                labelPlacement="outside"
                placeholder="Enter your description"
                value={user.basics.about}
                onChange={(e) =>
                  handleInputChange("basics.about", -1, "", e.target.value)
                }
                name="about"
                defaultValue="NextUI is a React UI library that provides a set of accessible, reusable, and beautiful components."
                className="max-w-xs text-ink-soft"
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Skills</p>
              <div className="flex max-w-xs w-full flex-col justify-start items-start gap-3">
                <Input
                  type="text"
                  labelPlacement="inside"
                  placeholder="Add your skills"
                  description=" Press Enter to add a new skill"
                  variant="bordered"
                  value={inputValue}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleSkillInputChange(e)
                  }
                  onKeyDown={(event) =>
                    handleSkillInputKeyDown(event, inputValue)
                  }
                  classNames={{
                    inputWrapper:
                      "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                  }}
                  endContent={
                    <Kbd className="font-dmSans text-xs" keys={["enter"]}>
                      Enter
                    </Kbd>
                  }
                  className=" text-xs max-w-xs flex-wrap"
                />
                <div className="w-full  flex flex-wrap gap-1 max-w-xs">
                  {user.basics.skills?.map((skill: string, index: number) => (
                    <Chip
                      key={index}
                      onClose={() => handleSkillClose(skill, skill)}
                      variant="flat"
                      classNames={{
                        closeButton: "text-ink-mute z-10",
                        base: "bg-parchment-100",
                      }}
                      className="flex mt-1 mb-1  items-center bg-none text-xs rounded-full border-1 border-ink/10 pl-2 "
                    >
                      {skill}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Contact Mail</p>
              <Input
                type="email"
                variant="bordered"
                value={user.basics.email}
                onChange={(e) =>
                  handleInputChange("basics.email", -1, "", e.target.value)
                }
                name="email"
                className="max-w-xs text-ink-soft"
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Location</p>
              <div className="flex gap-2 max-w-xs w-full">
                <Input
                  type="text"
                  variant="bordered"
                  value={user.basics.location.city}
                  onChange={(e) =>
                    handleInputChange(
                      "basics.location.city",
                      -1,
                      "",
                      e.target.value,
                    )
                  }
                  placeholder="City"
                  className="flex-1 text-ink-soft"
                  classNames={{
                    inputWrapper:
                      "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                  }}
                />
                <Input
                  type="text"
                  variant="bordered"
                  value={user.basics.location.countryCode}
                  onChange={(e) =>
                    handleInputChange(
                      "basics.location.countryCode",
                      -1,
                      "",
                      e.target.value,
                    )
                  }
                  placeholder="Country Code"
                  className="w-32 text-ink-soft"
                  classNames={{
                    inputWrapper: "border-1 shadow-none h-[40px]",
                  }}
                />
              </div>
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Button Text</p>
              <Input
                type="text"
                variant="bordered"
                value={user.meta.buttonText}
                onChange={(e) =>
                  handleInputChange("meta.buttonText", -1, "", e.target.value)
                }
                name="buttonText"
                className="max-w-xs text-ink-soft"
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Theme Color</p>
              <div className="flex flex-wrap max-w-xs gap-4">
                {tailwindColors.map((color, index) => (
                  <div
                    key={`color-${index}`}
                    style={{
                      backgroundColor: color.value,
                      border:
                        user.meta.portfolioColor === color.name
                          ? ".1rem solid black"
                          : "",
                    }}
                    className={`w-5 h-5 rounded-full cursor-pointer ${
                      color.name === "white" ? "border border-ink/25" : ""
                    } `}
                    onClick={() =>
                      setUser((prevUser) => ({
                        ...prevUser,
                        meta: {
                          ...prevUser.meta,
                          portfolioColor: color.name,
                        },
                      }))
                    }
                  ></div>
                ))}
              </div>
            </div>
          </div>{" "}
          <div
            id="work-experience"
            className="flex min-h-screen flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Work Experience
            </h2>
            {user.work &&
              user.work.length > 0 &&
              user.work.map((experience, index) => (
                <div
                  key={`work-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  {" "}
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() => deleteItemByIndex("work", index, setUser)}
                      aria-label={`Delete workExperience ${index}`}
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
                    <p className="pt-0.05">Company Logo</p>
                    <div className="flex max-w-xs w-full justify-start gap-2 items-center flex-row flex-wrap">
                      {experience.logo ? (
                        <img
                          src={experience.logo}
                          alt="Company Logo"
                          className="w-12 h-12 sm:h-12 sm:w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-parchment-200 rounded-xl">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6 text-ink-mute"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                            />
                          </svg>
                        </div>
                      )}
                      <label className=" flex flex-row gap-2 text-ink-mute cursor-pointer shadow-xs justify-center items-center  flex-1 px-3 h-12 rounded-xl border-dashed border border-ink/25 bg-parchment-100/50 hover:border-aura-violet/50 hover:bg-white hover:text-ink transition-colors">
                        <input
                          onChange={(event) => {
                            if (event.target.files) {
                              handleFileUpload(
                                event.target.files[0],
                                "workExperienceLogo",
                                index,
                              );
                            }
                          }}
                          type="file"
                          accept={ACCEPTED_IMAGE_INPUT}
                          className="  w-full hidden  font-body font-light text-ink/80 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-parchment-300 file:text-ink-soft hover:file:bg-ink-mute"

                          // {...getInputProps()}
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-4 text-ink-mute"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                          />
                        </svg>
                        {uploadStatus[`workExperienceLogo-${index}`] ===
                          "idle" && "Click to upload "}
                        {uploadStatus[`workExperienceLogo-${index}`] ===
                          "uploading" && "Uploading..."}
                        {uploadStatus[`workExperienceLogo-${index}`] ===
                          "uploaded" && "Logo  uploaded"}
                        {!uploadStatus[`workExperienceLogo-${index}`] &&
                          "Click to upload "}
                      </label>
                    </div>
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.05">Company Name</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={experience.name}
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("work", index, "name", e.target.value)
                      }
                      placeholder="Company name"
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.05">Role</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={experience.position}
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "work",
                          index,
                          "position",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.05">Period </p>
                    <div className="max-w-xs flex gap-2 text-ink-soft">
                      {" "}
                      <Input
                        classNames={{
                          inputWrapper:
                            "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                        }}
                        placeholder="Start eg: April 2020"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange(
                            "work",
                            index,
                            "startDate",
                            e.target.value,
                          )
                        }
                        value={experience.startDate}
                        variant="bordered"
                        className="max-w-xs text-ink-soft"
                        // value={[experience.start, experience.end]}
                      />
                      <Input
                        classNames={{
                          inputWrapper:
                            "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                        }}
                        placeholder="end"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange(
                            "work",
                            index,
                            "endDate",
                            e.target.value,
                          )
                        }
                        value={experience.endDate}
                        variant="bordered"
                        className="max-w-xs text-ink-soft"
                        // value={[experience.start, experience.end]}
                      />
                    </div>
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Summary</p>
                    <Textarea
                      variant="bordered"
                      labelPlacement="outside"
                      placeholder="Enter your description"
                      value={experience.summary}
                      className="max-w-xs text-ink-soft"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "work",
                          index,
                          "summary",
                          e.target.value,
                        )
                      }
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.05">Company Link</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={experience.website}
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "work",
                          index,
                          "website",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            <Button
              variant="bordered"
              onPress={addWork}
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
              Add Experience
            </Button>
          </div>
          <div
            id="education"
            className="flex flex-col  pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Education
            </h2>
            {user.education &&
              user.education.length > 0 &&
              user.education.map((edu, index) => (
                <div
                  key={`education-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  {" "}
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() =>
                        deleteItemByIndex("education", index, setUser)
                      }
                      aria-label={`Delete education ${index}`}
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
                    <p className="pt-.05">College Logo</p>
                    <div className="flex max-w-xs w-full justify-start gap-2 items-center flex-row flex-wrap">
                      {edu.logo ? (
                        <img
                          src={edu.logo}
                          alt="College Logo"
                          className="w-12 h-12 sm:h-12 sm:w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-parchment-200 rounded-xl">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6 text-ink-mute"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                            />
                          </svg>
                        </div>
                      )}

                      <label className=" flex flex-row gap-2 text-ink-mute cursor-pointer shadow-xs justify-center items-center  flex-1 px-3 h-12 rounded-xl border-dashed border border-ink/25 bg-parchment-100/50 hover:border-aura-violet/50 hover:bg-white hover:text-ink transition-colors">
                        <input
                          onChange={(event) => {
                            if (event.target.files) {
                              handleFileUpload(
                                event.target.files[0],
                                "educationLogo",
                                index,
                              );
                            }
                          }}
                          type="file"
                          accept={ACCEPTED_IMAGE_INPUT}
                          className="  w-full hidden  font-body font-light text-ink/80 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-parchment-300 file:text-ink-soft hover:file:bg-ink-mute"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-4 text-ink-mute"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                          />
                        </svg>
                        {uploadStatus[`educationLogo-${index}`] === "idle" &&
                          "Click to upload "}
                        {uploadStatus[`educationLogo-${index}`] ===
                          "uploading" && "Uploading..."}
                        {uploadStatus[`educationLogo-${index}`] ===
                          "uploaded" && "Logo  uploaded"}
                        {!uploadStatus[`educationLogo-${index}`] &&
                          "Click to upload "}{" "}
                      </label>
                    </div>
                  </div>{" "}
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">College Name</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={edu.institution}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "education",
                          index,
                          "institution",
                          e.target.value,
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
                    <p className="pt-.05">Field of Study</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={edu.area}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "education",
                          index,
                          "area",
                          e.target.value,
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>{" "}
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Period</p>
                    <div className="max-w-xs flex gap-2 text-ink-soft">
                      {" "}
                      <Input
                        classNames={{
                          inputWrapper:
                            "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                        }}
                        placeholder="Start eg: April 2020"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange(
                            "education",
                            index,
                            "startDate",
                            e.target.value,
                          )
                        }
                        value={edu.startDate}
                        variant="bordered"
                        className="max-w-xs text-ink-soft"
                        // value={[experience.start, experience.end]}
                      />
                      <Input
                        classNames={{
                          inputWrapper:
                            "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                        }}
                        placeholder="end"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange(
                            "education",
                            index,
                            "endDate",
                            e.target.value,
                          )
                        }
                        value={edu.endDate}
                        variant="bordered"
                        className="max-w-xs text-ink-soft"
                        // value={[experience.start, experience.end]}
                      />
                    </div>
                  </div>
                </div>
              ))}
            <Button
              variant="bordered"
              onPress={addEducation}
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
              Add Education
            </Button>
          </div>
          <div
            id="project"
            className="flex flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Projects
            </h2>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">Project description</p>
              <Textarea
                type="text"
                variant="bordered"
                value={user.projects.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(
                    "projects.description",
                    -1,
                    "",
                    e.target.value,
                  )
                }
                name="projects.description"
                className="max-w-xs text-ink-soft"
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            {user.projects &&
              user.projects.projects.length > 0 &&
              user.projects.projects.map((project, index) => (
                <div
                  key={`project-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  {" "}
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() =>
                        deleteItemByIndex("projects.projects", index, setUser)
                      }
                      aria-label={`Delete projects ${index}`}
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
                    <p className="pt-0.05">Project Image</p>
                    <div className="flex max-w-xs w-full justify-start gap-2 items-center flex-row flex-wrap">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt="Project Image"
                          className="w-12 h-12 sm:h-12 sm:w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-parchment-200 rounded-xl">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6 text-ink-mute"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                            />
                          </svg>
                        </div>
                      )}

                      <label className="flex flex-row gap-2 text-ink-mute cursor-pointer shadow-xs justify-center items-center flex-1 px-3 h-12 rounded-xl border-dashed border border-ink/25 bg-parchment-100/50 hover:border-aura-violet/50 hover:bg-white hover:text-ink transition-colors">
                        <input
                          onChange={(event) => {
                            if (event.target.files) {
                              handleFileUpload(
                                event.target.files[0],
                                "projectImage",
                                index,
                              );
                            }
                          }}
                          type="file"
                          accept={ACCEPTED_IMAGE_INPUT}
                          className="  w-full hidden  font-body font-light text-ink/80 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-parchment-300 file:text-ink-soft hover:file:bg-ink-mute"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-4 text-ink-mute"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                          />
                        </svg>
                        {uploadStatus[`projectImage-${index}`] === "idle" &&
                          "Click to upload "}
                        {uploadStatus[`projectImage-${index}`] ===
                          "uploading" && "Uploading..."}
                        {uploadStatus[`projectImage-${index}`] === "uploaded" &&
                          "Logo  uploaded"}
                        {!uploadStatus[`projectImage-${index}`] &&
                          "Click to upload "}{" "}
                      </label>
                    </div>
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Project name</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={project.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "projects.projects",
                          index,
                          "title",
                          e.target.value,
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
                    <p className="pt-.05">Period</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={project.duration}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "projects.projects",
                          index,
                          "duration",
                          e.target.value,
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
                    <p className="pt-.05">Description</p>
                    <Textarea
                      variant="bordered"
                      labelPlacement="outside"
                      placeholder="Enter your description"
                      value={project.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "projects.projects",
                          index,
                          "description",
                          e.target.value,
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
                    <p className="pt-.05">Stack</p>
                    <div className="flex max-w-xs w-full flex-col justify-start items-start gap-3">
                      <div className="flex w-full gap-2">
                        <Input
                          type="text"
                          labelPlacement="inside"
                          placeholder="Add a technology"
                          description=" Press Enter to add a new technology"
                          variant="bordered"
                          value={inputValueProject}
                          onChange={(event) =>
                            setInputValueProject(event.target.value)
                          }
                          onKeyDown={(event) =>
                            handleTechnologyInputKeyDown(
                              event,
                              index,
                              inputValueProject,
                            )
                          }
                          classNames={{
                            inputWrapper:
                              "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                          }}
                          endContent={
                            <Kbd
                              className="font-dmSans text-xs"
                              keys={["enter"]}
                            >
                              Enter
                            </Kbd>
                          }
                          className="text-xs flex-1"
                        />
                        <Button
                          size="sm"
                          variant="bordered"
                          onPress={() => {
                            if (inputValueProject.trim() !== "") {
                              handleTechnologyInputKeyDown(
                                {
                                  key: "Enter",
                                } as KeyboardEvent<HTMLInputElement>,
                                index,
                                inputValueProject,
                              );
                            }
                          }}
                          className="min-w-[40px] h-[40px] p-0 rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-ink-soft"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                        </Button>
                      </div>
                      <div className="w-full flex flex-wrap gap-1 max-w-xs">
                        {project.technologies.map((tech, techIndex) => (
                          <Chip
                            key={`tech-${techIndex}`}
                            onClose={() => handleTechnologyClose(index, tech)}
                            variant="flat"
                            classNames={{
                              closeButton: "text-ink-mute z-10",
                              base: "bg-parchment-100",
                            }}
                            className="flex mt-1 mb-1 items-center bg-none text-xs rounded-full border-1 border-ink/10 pl-2"
                          >
                            {tech}
                          </Chip>
                        ))}
                      </div>
                    </div>{" "}
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Website link</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={project.website}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "projects.projects",
                          index,
                          "website",
                          e.target.value,
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
                    <p className="pt-.05">Source Link</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={project.source}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "projects.projects",
                          index,
                          "source",
                          e.target.value,
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
              onPress={addProjects}
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
              Add Project
            </Button>
          </div>{" "}
          <div
            id="hackathon"
            className="flex flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Hackathons
            </h2>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">Hackathon Description</p>
              <Textarea
                type="text"
                variant="bordered"
                value={user.hackathons.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(
                    "hackathons.description",
                    -1,
                    "",
                    e.target.value,
                  )
                }
                className="max-w-xs text-ink-soft"
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            {user.hackathons &&
              user.hackathons.hackathons.length > 0 &&
              user.hackathons.hackathons.map((hackathon, index) => (
                <div
                  key={`hackathon-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() =>
                        deleteItemByIndex(
                          "hackathons.hackathons",
                          index,
                          setUser,
                        )
                      }
                      aria-label={`Delete hackathon ${index}`}
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
                    <p className="pt-0.5">Hackathon logo</p>
                    <div className="flex max-w-xs w-full justify-start gap-2 items-center flex-row flex-wrap">
                      {hackathon.image ? (
                        <img
                          src={hackathon.image}
                          alt="Company Logo"
                          className="w-12 h-12 sm:h-12 sm:w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-parchment-200 rounded-xl">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6 text-ink-mute"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                            />
                          </svg>
                        </div>
                      )}{" "}
                      <label className="flex flex-row gap-2 text-ink-mute cursor-pointer shadow-xs justify-center items-center flex-1 px-3 h-12 rounded-xl border-dashed border border-ink/25 bg-parchment-100/50 hover:border-aura-violet/50 hover:bg-white hover:text-ink transition-colors">
                        <input
                          onChange={(event) => {
                            event.preventDefault();

                            if (event.target.files) {
                              handleFileUpload(
                                event.target.files[0],
                                "hackathonLogo",
                                index,
                              );
                            }
                          }}
                          type="file"
                          accept={ACCEPTED_IMAGE_INPUT}
                          className="  w-full hidden  font-body font-light text-ink/80 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-parchment-300 file:text-ink-soft hover:file:bg-ink-mute"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-4 text-ink-mute"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                          />
                        </svg>
                        {uploadStatus[`hackathonLogo-${index}`] === "idle" &&
                          "Click to upload "}
                        {uploadStatus[`hackathonLogo-${index}`] ===
                          "uploading" && "Uploading..."}
                        {uploadStatus[`hackathonLogo-${index}`] ===
                          "uploaded" && "Logo  uploaded"}
                        {!uploadStatus[`hackathonLogo-${index}`] &&
                          "Click to upload "}{" "}
                        <input
                          type="file"
                          accept={ACCEPTED_IMAGE_INPUT}
                          className="w-full hidden font-body font-light text-ink/80 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-parchment-300 file:text-ink-soft hover:file:bg-ink-mute"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.5">Hackathon name</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={hackathon.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "hackathons.hackathons",
                          index,
                          "title",
                          e.target.value,
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
                    <p className="pt-0.5">Location</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={hackathon.location}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "hackathons.hackathons",
                          index,
                          "location",
                          e.target.value,
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
                    <p className="pt-0.5">Date</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={hackathon.dates}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "hackathons.hackathons",
                          index,
                          "dates",
                          e.target.value,
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
                    <p className="pt-0.5">Description</p>
                    <Textarea
                      variant="bordered"
                      labelPlacement="outside"
                      placeholder="Enter your description"
                      value={hackathon.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "hackathons.hackathons",
                          index,
                          "description",
                          e.target.value,
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
                    <p className="pt-0.5">Website link</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={hackathon.url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "hackathons.hackathons",
                          index,
                          "links.website",
                          e.target.value,
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
              onPress={addHackathons}
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
              Add Hackathon
            </Button>
          </div>
          {/* Awards Section */}
          <div
            id="awards"
            className="flex flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Awards
            </h2>
            {user.awards &&
              user.awards.length > 0 &&
              user.awards.map((award, index) => (
                <div
                  key={`award-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() =>
                        deleteItemByIndex("awards", index, setUser)
                      }
                      aria-label={`Delete award ${index}`}
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
                    <p className="pt-.05">Award Title</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={award.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "awards",
                          index,
                          "title",
                          e.target.value,
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
                    <p className="pt-.05">Awarder</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={award.awarder}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "awards",
                          index,
                          "awarder",
                          e.target.value,
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
                      value={award.date}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "awards",
                          index,
                          "date",
                          e.target.value,
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
                      value={award.summary}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "awards",
                          index,
                          "summary",
                          e.target.value,
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
              onPress={addAwards}
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
              Add Award
            </Button>
          </div>
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
          <div
            id="skills"
            className="flex flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Skills
            </h2>
            {user.skills &&
              user.skills.length > 0 &&
              user.skills.map((skill, index) => (
                <div
                  key={`skill-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() =>
                        deleteItemByIndex("skills", index, setUser)
                      }
                      aria-label={`Delete skill ${index}`}
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
                    <p className="pt-.05">Skill Name</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={skill.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "skills",
                          index,
                          "name",
                          e.target.value,
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
                    <p className="pt-.05">Keywords</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={
                        Array.isArray(skill.keywords)
                          ? skill.keywords.join(", ")
                          : ""
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "skills",
                          index,
                          "keywords",
                          e.target.value,
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
              onPress={addSkills}
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
              Add Skill
            </Button>
          </div>
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
          <div
            id="languages"
            className="flex flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Languages
            </h2>
            {user.languages &&
              user.languages.length > 0 &&
              user.languages.map((language, index) => (
                <div
                  key={`language-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() =>
                        deleteItemByIndex("languages", index, setUser)
                      }
                      aria-label={`Delete language ${index}`}
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
                    <p className="pt-.05">Language</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={language.language}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "languages",
                          index,
                          "language",
                          e.target.value,
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
                    <p className="pt-.05">Fluency</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={language.fluency}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "languages",
                          index,
                          "fluency",
                          e.target.value,
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
              onPress={addLanguages}
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
              Add Language
            </Button>
          </div>
          {/* Volunteer Section */}
          <div
            id="volunteer"
            className="flex flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Volunteer Work
            </h2>
            {user.volunteer &&
              user.volunteer.length > 0 &&
              user.volunteer.map((work, index) => (
                <div
                  key={`volunteer-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() =>
                        deleteItemByIndex("volunteer", index, setUser)
                      }
                      aria-label={`Delete volunteer work ${index}`}
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
                    <p className="pt-.05">Organization</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={work.organization}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "volunteer",
                          index,
                          "organization",
                          e.target.value,
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
                    <p className="pt-.05">Position</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={work.position}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "volunteer",
                          index,
                          "position",
                          e.target.value,
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
                      value={work.url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "volunteer",
                          index,
                          "url",
                          e.target.value,
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
                    <p className="pt-.05">Start Date</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={work.startDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "volunteer",
                          index,
                          "startDate",
                          e.target.value,
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
                      value={work.summary}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "volunteer",
                          index,
                          "summary",
                          e.target.value,
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
              onPress={addVolunteer}
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
              Add Volunteer Work
            </Button>
          </div>
          {/* Interests Section */}
          <div
            id="interests"
            className="flex flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Interests
            </h2>
            {user.interests &&
              user.interests.length > 0 &&
              user.interests.map((interest, index) => (
                <div
                  key={`interest-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() =>
                        deleteItemByIndex("interests", index, setUser)
                      }
                      aria-label={`Delete interest ${index}`}
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
                    <p className="pt-.05">Interest Name</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={interest.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "interests",
                          index,
                          "name",
                          e.target.value,
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
                    <p className="pt-.05">Keywords</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={interest.keywords.join(", ")}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "interests",
                          index,
                          "keywords",
                          e.target.value,
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
              onPress={addInterests}
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
              Add Interest
            </Button>
          </div>
          {/* References Section */}
          <div
            id="references"
            className="flex flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              References
            </h2>
            {user.references &&
              user.references.length > 0 &&
              user.references.map((reference, index) => (
                <div
                  key={`reference-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() =>
                        deleteItemByIndex("references", index, setUser)
                      }
                      aria-label={`Delete reference ${index}`}
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
                    <p className="pt-.05">Name</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={reference.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "references",
                          index,
                          "name",
                          e.target.value,
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
                    <p className="pt-.05">Reference</p>
                    <Textarea
                      variant="bordered"
                      value={reference.reference}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "references",
                          index,
                          "reference",
                          e.target.value,
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
              onPress={addReferences}
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
              Add Reference
            </Button>
          </div>
          <div
            id="social-links"
            className="flex flex-col pb-6 pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Social Links
            </h2>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">LinkedIn</p>
              <Input
                type="text"
                variant="bordered"
                value={
                  user.basics.profiles.find(
                    (profile) => profile.network === "LinkedIn",
                  )?.url || ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSocialProfileChange("LinkedIn", e.target.value, setUser)
                }
                className="max-w-xs text-ink-soft"
                startContent={
                  <img
                    src="/icon/linkedin.png"
                    className="w-6 h-6 opacity-70"
                    alt="LinkedIn"
                  />
                }
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">GitHub</p>
              <Input
                type="text"
                variant="bordered"
                value={
                  user.basics.profiles.find(
                    (profile) => profile.network === "GitHub",
                  )?.url || ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSocialProfileChange("GitHub", e.target.value, setUser)
                }
                className="max-w-xs text-ink-soft"
                startContent={
                  <img
                    src="/icon/github.png"
                    className="w-6 h-6 opacity-70"
                    alt="GitHub"
                  />
                }
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">Twitter</p>
              <Input
                type="text"
                variant="bordered"
                value={
                  user.basics.profiles.find(
                    (profile) => profile.network === "X",
                  )?.url || ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSocialProfileChange("X", e.target.value, setUser)
                }
                className="max-w-xs text-ink-soft"
                startContent={
                  <img
                    src="/icon/twitter.png"
                    className="w-5 h-5 opacity-70"
                    alt="Twitter"
                  />
                }
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">YouTube</p>
              <Input
                type="text"
                variant="bordered"
                value={
                  user.basics.profiles.find(
                    (profile) => profile.network === "Youtube",
                  )?.url || ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSocialProfileChange("Youtube", e.target.value, setUser)
                }
                className="max-w-xs text-ink-soft"
                startContent={
                  <img
                    src="/icon/youtube.png"
                    className="w-5 h-5 opacity-70"
                    alt="YouTube"
                  />
                }
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">Dribbble</p>
              <Input
                type="text"
                variant="bordered"
                value={
                  user.basics.profiles.find(
                    (profile) => profile.network === "Dribbble",
                  )?.url || ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSocialProfileChange("Dribbble", e.target.value, setUser)
                }
                className="max-w-xs text-ink-soft"
                startContent={
                  <img
                    src="/icon/dribbble.png"
                    className="w-5 h-5 opacity-70"
                    alt="Dribbble"
                  />
                }
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
          </div>
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
            <ResumeTemplate profile={user} />
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
  );
}
