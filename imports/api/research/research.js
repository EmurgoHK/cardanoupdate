import { Mongo } from 'meteor/mongo'
import { FilesCollection } from 'meteor/ostrio:files';

import os from "os";
import path from "path";
import mkdirp from "mkdirp";

export const Research = new Mongo.Collection('research');

export const ResearchFiles = new FilesCollection({
  collectionName: 'researchFiles',
  storagePath: ()=> {
    const par = path.join(os.homedir(), "cardanoupdate_assets", "static", "research");
    mkdirp.sync(par);
    return par;
  },
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // Allow upload files under 50MB, and only in pdf formats
    if (file.size > 5*10485760 || !/pdf/i.test(file.extension)) {
      return 'Please upload pdf, with size equal or less than 50MB';
    }
    // Only logged in users can upload
    if (!Meteor.userId()) {
      return 'Only logged in users can upload';
    }

    return true
  }
});
