import "./researchCard.html";
import "./researchCard.scss";

import { Template } from "meteor/templating";

import { removeResearch, flagResearch } from "/imports/api/research/methods";
import swal from "sweetalert2";

import { notify } from "/imports/modules/notifier";
import { flagDialog } from "/imports/modules/flagDialog";

Template.researchCard.helpers({
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
  editURL() {
    const research = Template.currentData().research;
    if (research.createdBy === Meteor.userId()) {
      return `/research/${research.slug}/edit`;
    }
    return false;
  }
});

Template.researchCard.events({
  "click #js-remove": function(event, _) {
    event.preventDefault();

    const research = Template.currentData().research;
    swal({
      text: `Are you sure you want to remove this research papaer? This action is not reversible.`,
      type: "warning",
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed.value) {
        removeResearch.call(
          {
            researchId: research._id
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
  "click .flag-research": function(event, templateInstance) {
    event.preventDefault();

    flagDialog.call(
      Template.currentData().research,
      flagResearch,
      "researchId"
    );
  }
});
