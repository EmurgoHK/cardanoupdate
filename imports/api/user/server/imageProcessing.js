import { ProfileImages } from "../profileImages";
import createThumbnails from "./createThumbnail";

ProfileImages.on('afterUpload', (fileRef) => {
  if (/png|jpe?g/i.test(fileRef.extension || '')) {
    createThumbnails(ProfileImages, fileRef, (error, fileRef) => {
      if (error) {
        console.error(error);
      }
    });
  }
});