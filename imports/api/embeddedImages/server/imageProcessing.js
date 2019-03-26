import { EmbeddedImages } from "../embeddedImages";
import createThumbnails from "../../createThumbnail";

EmbeddedImages.on('afterUpload', (fileRef) => {
  if (/png|jpe?g/i.test(fileRef.extension || '')) {
    createThumbnails(EmbeddedImages, fileRef, (error, fileRef) => {
      if (error) {
        console.error(error);
      }
    });
  }
});