import "./learningResourceList.html";

import { Template } from "meteor/templating";

import {
  removeLearningItem,
  flagLearningItem
} from "/imports/api/learn/methods";
import swal from "sweetalert2";

import { notify } from "/imports/modules/notifier";
import { flagDialog } from "/imports/modules/flagDialog";

Template.learningResourceList.helpers({
  canEdit: function() {
    return this.createdBy === Meteor.userId();
  }
});

Template.learningResourceList.events({
  "click #js-remove": function(event, templateInstance) {
    event.preventDefault();

    swal({
      text: `Are you sure you want to remove this learning resource? This action is not reversible.`,
      type: "warning",
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed.value) {
        removeLearningItem.call(
          {
            learnId: this._id
          },
          (err, data) => {
            if (err) {
              notify(err.reason || err.message, "error");
            }
          }
        );
      }
    });
  },
  "click .flag-learn": function(event, templateInstance) {
    event.preventDefault();

    flagDialog.call(this, flagLearningItem, "learnId");
  }
});
