import "./uploader.html";
import "./uploader.scss";

import { Template } from "meteor/templating";

import { notify } from "../../../modules/notifier";

/*
Uploader is a shared component used on a lot of templates
When used, it accepts the following optional parameters: 
- files (fsFile) - An array of already uploaded files to show in the preview element
- single (boolean) - if we only want a single file uploaded
- showFileList (boolean) - shows or hide fileList
- collection (fsCollection) - collection to use to save files
- fileAdded (function) - a callback to call when a file has been added to the db
- deleteFile (function) - a callback to call when the users click the file delete button

Only modify the uploader code below if you're modifying the uplaoder itself (e.g. extending its functionality, adding new features, etc)
In other cases, if you want to change what's done with uploaded files, modify the template that's using the uploader and not the uploader itself
*/

Template.progressiveUploader.onCreated(function() {
  this.uploadedFiles = new ReactiveVar([]);
  this.currentUpload = new ReactiveVar(undefined);
})
Template.progressiveUploader.helpers({
  files: () => {
    return Template.instance().uploadedFiles.get().concat(Template.currentData().files)
  },
  id: () => Template.instance().id,
  isPDF: file => file.extension().toLowerCase() === "pdf",
  link: (file, version) => {
    return Template.currentData().collection.link(file, version || 'original');
  },
  currentUpload: () => Template.instance().currentUpload.get(),
});

Template.progressiveUploader.events({
  "change .fileInput": (event, templateInstance) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      // We upload only one file, in case
      // multiple files were selected
      const data = Template.currentData();
      const upload = data.collection.insert({
        file: event.currentTarget.files[0],
        streams: 'dynamic',
        chunkSize: 'dynamic'
      }, false);
      
      if (data.single) {
        if (templateInstance.uploadedFiles.get().length !== 0) {
          const upload = templateInstance.uploadedFiles.get().pop();
          data.fileDelete(upload._id);
        } else if (data.files.length !== 0) {
          data.fileDelete(data.files[0]);
        }
      }

      upload.on('start', () => {
        templateInstance.currentUpload.set(upload);
      });

      upload.on('end', (error, fileObj) => {
        if (error) {
          notify('Error during upload: ' + error, 'error');
        } else {
          templateInstance.uploadedFiles.set(templateInstance.uploadedFiles.get().concat([fileObj]));
          templateInstance.currentUpload.set(undefined);
          
          if (data.fileAdded)
            data.fileAdded(fileObj._id);
        }
      });

      upload.start();
    }
  },

  "click .deleteFile": (event, templateInstance) => {
    const id = event.target.getAttribute('data-id');
    Template.currentData().fileDelete(id);
    const uploaded = templateInstance.uploadedFiles.get();
    templateInstance.uploadedFiles.set(uploaded.filter(a => a._id !== id));
  }
});
