import './commentForm.html';

import { newComment, editComment } from '/imports/api/comments/methods';

Template.commentForm.onCreated(function () {
  this.text = new ReactiveVar("");
  this.error = new ReactiveVar("");

  this.autorun(() => {
    const data = Template.currentData();
    this.text.set(data.text);
  });
});

Template.commentForm.helpers({
  text() {
    return Template.instance().text.get();
  },
  error() {
    return Template.instance().error.get();
  },
  saveButtonText() {
    const data = Template.currentData();
    if (data.saveButtonText) return data.saveButtonText;

    if (data.id)
      return "Edit";

    if (data.parentId !== data.newsId)
      return "Reply";

    return "Comment";
  },
  placeholder() {
    return Template.currentData().placeholder || "Comment something!";
  },

  wrapperClasses() {
    return Template.currentData().wrapperClasses || "";
  }
})

Template.commentForm.events({
  'keyup/blur comment-text': (event, templateInstance) => {
    templateInstance.text.set(templateInstance.$('.comment-text').val());

    return false;
  },

  'click .save-comment': (event, templateInstance) => { 
    const data = Template.currentData();
    const text = templateInstance.$('.comment-text').val();
    if (data.id) {
      editComment.call({
        commentId: data.id,
        text,
      }, (err, res) => {  
        if (!err) {
          templateInstance.text.set('');
          templateInstance.error.set('');
          data.onSuccess(res);
        } else {
          templateInstance.error.set(err.reason || err.message);
        }
      });
    } else {
      newComment.call({
        newsId: data.newsId,
        parentId: data.parentId,
        postType: data.postType,
        type: data.type,
        text,
      }, (err, res) => {  
        if (!err) {
          templateInstance.text.set('');
          templateInstance.error.set('');
          data.onSuccess(res);
        } else {
          templateInstance.error.set(err.reason || err.message);
        }
      })
    }
  },
  'click .cancel-comment': (event, templateInstance) => { 
    const data = Template.currentData();
    data.onCancel();
  },
});