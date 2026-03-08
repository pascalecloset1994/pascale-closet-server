import { put, del } from "@vercel/blob";

export const updateToBlob = async (file) => {
  // Obtener extensión del archivo original
  const ext = file.originalname
    ? file.originalname.split(".").pop().toLowerCase()
    : "jpg";

  const blob = await put(
    `products/${Date.now()}.${ext}`,
    file.buffer,
    { access: "public", allowOverwrite: true }
  )
  return blob.url;
};

export const deleteFromBlob = async (imageUrl) => {
  try {
    await del(imageUrl);
    return true;
  } catch (error) {
    console.error("Error al eliminar imagen de Blob:", error);
    return false;
  }
};
