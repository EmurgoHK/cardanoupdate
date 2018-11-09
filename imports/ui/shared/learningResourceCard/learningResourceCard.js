import "./learningResourceCard.html";
import "./learningResourceCard.scss";

import { Template } from "meteor/templating";

import {
  removeLearningItem,
  flagLearningItem
} from "/imports/api/learn/methods";
import swal from "sweetalert2";

import { notify } from "/imports/modules/notifier";
import { flagDialog } from "/imports/modules/flagDialog";

Template.learningResourceCard.helpers({
  editURL() {
    const learn = Template.currentData().learn;
    if(learn.createdBy === Meteor.userId()){
      return `/learn/${learn.slug}/edit`
    }
    return false
  },
  limitChars(val) {
    return val && val.length > 50 ? val.slice(0, 50) + " ... " : val;
  },
  learningLevel () {
    let level = Template.currentData().learn.difficultyLevel;
    if(level){
      if(level === 'beginner'){
        return `<span class="text-success" title="Difficulty Level"><i class="fa fa-circle"></i> ${level}</span>`
      } else if (level === 'intermediate') {
        return `<span class="text-warning" title="Difficulty Level"><i class="fa fa-circle"></i> ${level}</span>`
      } else {
        return `<span class="text-danger" title="Difficulty Level"><i class="fa fa-circle"></i> ${level}</span>`
      }
    }
    return false
  }
});

Template.learningResourceCard.events({
  "click #js-remove": function(event, templateInstance) {
    event.preventDefault();

    const learn = Template.currentData().learn;
    swal({
      text: `Are you sure you want to remove this learning resource? This action is not reversible.`,
      type: "warning",
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed.value) {
        removeLearningItem.call(
          {
            learnId: learn._id
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

    flagDialog.call(Template.currentData().learn, flagLearningItem, "learnId");
  }
});
