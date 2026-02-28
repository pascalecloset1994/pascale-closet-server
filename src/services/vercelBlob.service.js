import { put } from "@vercel/blob";
import sharp from "sharp";

export const updateToBlob = async (file) => {
  const optimizedImage = await sharp(file.buffer)
    .webp({ quality: 80 })
    .toBuffer();
  const blob = await put(`products/${Date.now()}.webp`, optimizedImage, {
    access: "public",
  });
  const imageUrl = blob.url;
  return imageUrl;
};
