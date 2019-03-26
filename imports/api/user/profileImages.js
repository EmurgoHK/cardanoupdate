import { FilesCollection } from 'meteor/ostrio:files';
import os from "os";
import path from "path";
import mkdirp from "mkdirp";

export const ProfileImages = new FilesCollection({
  collectionName: 'profileImages',
  storagePath: ()=> {
    const par = path.join(os.homedir(), "cardanoupdate_assets", "static", "profile");
    mkdirp.sync(par);
    return par;
  },
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // Allow upload files under 50MB, and only in pdf formats
    if (file.size > 10485760 || !/png|jpe?g/i.test(file.extension)) {
      return 'Please upload png, jpg or jpeg with size equal or less than 10MB';
    }
    // Only logged in users can upload
    if (!Meteor.userId()) {
      return 'Only logged in users can upload';
    }

    return true
  },
});
