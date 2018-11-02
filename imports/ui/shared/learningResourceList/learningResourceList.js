import "./learningResourceList.html";
import "./learningResourceList.scss";

import { Template } from "meteor/templating";

import {
  removeLearningItem,
  flagLearningItem
} from "/imports/api/learn/methods";
import swal from "sweetalert2";

import { notify } from "/imports/modules/notifier";
import { flagDialog } from "/imports/modules/flagDialog";

Template.learningResourceList.helpers({
  containerClasses() {
    return this.containerClass || "card-columns";
  },
  cardWrapperClasses() {
    return Template.parentData().cardWrapperClass || "";
  },
  editURL() {
    if(this.createdBy === Meteor.userId()){
      return `/learn/${this.slug}/edit`
    }
    return false
  },
  limitChars(val) {
    return val && val.length > 50 ? val.slice(0, 50) + " ... " : val;
  },
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
