import { put } from "@vercel/blob";
import sharp from "sharp";

export const updateToBlob = async (file) => {
  // Configurar sharp para manejar imágenes grandes (iPhone 15 = 24MP, ~4000px)
  // limitInputPixels evita errores con imágenes de alta resolución
  const optimizedImage = await sharp(file.buffer, {
    failOn: "none", // No fallar por metadata corrupta o warnings
    limitInputPixels: 268402689, // ~16384 x 16384 - soporta hasta 268MP
  })
    .rotate() // Auto-rotar según EXIF
    .resize({
      width: 1920,
      height: 1920,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85, mozjpeg: true }) // JPEG más compatible que WebP para algunos navegadores
    .toBuffer();

  const blob = await put(`products/${Date.now()}.jpg`, optimizedImage, {
    access: "public",
  });
  return blob.url;
};
