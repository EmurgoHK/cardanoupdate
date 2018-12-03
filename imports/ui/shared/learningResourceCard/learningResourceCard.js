import "./learningResourceCard.html";
import "./learningResourceCard.scss";

import { Template } from "meteor/templating";

import {
  removeLearningItem,
  flagLearningItem
} from "/imports/api/learn/methods";

import { notify } from "/imports/modules/notifier";
import { flagDialog } from "/imports/modules/flagDialog";
import { loggedInSWAL } from "../../helpers/loggedInSWAL";

Template.learningResourceCard.helpers({
  editURL() {
    const learn = Template.currentData().learn;
    if(learn.createdBy === Meteor.userId()){
      return `/learn/${learn.slug}/edit`
    }
    return false
  },
  limitChars(val) {
    const limitedText = val && val.length > 50 ? val.slice(0, 50) + " ... " : val;
    const transformer = Template.currentData().textTransformer;
    if (transformer) return transformer(limitedText);
    return limitedText;
  },
  transform(text) {
    const transformer = Template.currentData().textTransformer;
    return transformer ? transformer(text) : text;
  },
  learningLevel () {
    let level = Template.currentData().learn.difficultyLevel;
    if(level){
      if(level === 'beginner'){
        return `<span class="text-success" title="Difficulty Level"><i class="fa fa-circle"></i> ${TAPi18n.__(`learn.view.${level}`)}</span>`
      } else if (level === 'intermediate') {
        return `<span class="text-warning" title="Difficulty Level"><i class="fa fa-circle"></i> ${TAPi18n.__(`learn.view.${level}`)}</span>`
      } else {
        return `<span class="text-danger" title="Difficulty Level"><i class="fa fa-circle"></i> ${TAPi18n.__(`learn.view.${level}`)}</span>`
      }
    }
    return false
  },
  translationsWithHref() {
    const data = Template.currentData();
    return data.translations.filter(t => t.slug !== data.learn.slug).map((t) => ({language: t.language, href: `/learn/${t.slug}`}));
  },
});

Template.learningResourceCard.events({
  "click #js-remove": function(event, templateInstance) {
    event.preventDefault();

    const learn = Template.currentData().learn;
    loggedInSWAL({
			action: 'shared.loginModal.action.delete',
      text: TAPi18n.__('learn.card.are_you_sure'),
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
              notify(TAPi18n.__(err.reason || err.message), "error");
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
