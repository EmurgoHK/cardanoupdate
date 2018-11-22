import "./commentArea.html";
import "./commentArea.scss";

import { Comments } from '/imports/api/comments/comments';
Template.commentArea.onCreated(function () {
  this.autorun(() => {
    this.subscribe('comments.item', Template.currentData().parentId)
  });
});

Template.commentArea.helpers({
  formArgs() {
    const instance = Template.instance();

    return {
      wrapperClasses: "card-body",
      newsId: instance.data.parentId,
      parentId: instance.data.parentId,
      type: instance.data.type,
      postType: instance.data.postType,
      onSuccess: instance.data.commentSuccess,
      hideCancel: true,
    };
  },
  wrapperClasses() {
    return Template.currentData().wrapperClasses || "";
  },
  comments: () => {
    const data = Template.currentData();

    return Comments.find(
      {
        parentId: data.parentId,
        type: data.type,
      },
      {
        sort: {
          createdAt: -1,
        },
      },
    );
  },
});
