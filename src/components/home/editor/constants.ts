// Image upload constraints shared by the studio editor and its sections.
// Raster image formats are accepted up to the size cap below; SVG and WebP
// are explicitly rejected.
export const MAX_IMAGE_SIZE_MB = 5;
export const ACCEPTED_IMAGE_INPUT =
  "image/png,image/jpeg,image/jpg,image/gif,image/bmp";
const BLOCKED_IMAGE_TYPES = ["image/svg+xml", "image/webp"];
const BLOCKED_IMAGE_EXTENSIONS = ["svg", "webp"];

// Returns an error message when the file is not an acceptable image, else null.
export const validateImageFile = (
  file: File | undefined | null,
): string | null => {
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
