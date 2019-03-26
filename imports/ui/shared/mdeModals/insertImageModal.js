import { Template } from "meteor/templating";

import swal from 'sweetalert2';
import SimpleMDE from 'simplemde';

import { EmbeddedImages } from "../../../api/embeddedImages/embeddedImages";
import { replaceSelection } from "./replaceSelection";
import "../progressiveUploader/uploader";

export const insertImageModal = (editor) => {
  const cm = editor.codemirror;
  const state = SimpleMDE.prototype.getState.call(editor);
  let view;
  let uploadedFileId;
  swal({
    title: TAPi18n.__('shared.uploader.insert_image'),
    html: '<div id="uploader"></div>',
    showCloseButton: true,
    showCancelButton: true,
    focusConfirm: false,
    confirmButtonText: '<i class="fa fa-plus"></i> Insert',
    confirmButtonAriaLabel: 'Insert image!',
    cancelButtonText: TAPi18n.__('shared.uploader.cancel'),
    cancelButtonAriaLabel: 'Cancel',
  }).then(data => {
    if (data.value) {
      if (uploadedFileId) {
        replaceSelection(cm, state.image, ['![](', '#url#)'], EmbeddedImages.findOne(uploadedFileId).link());
      }
    }
    Blaze.remove(view);
  });
  view = Blaze.renderWithData(Template.progressiveUploader, {
    files: [],
    collection: EmbeddedImages,
    showFileList: true,
    single: true,
    fileAdded: (file) => uploadedFileId = file,
    fileDelete: () => uploadedFileId = undefined,
  }, $('#uploader').get(0));
};
