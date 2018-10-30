import "./researchList.html";
import "./researchList.scss";

import { Template } from "meteor/templating";

import { removeResearch, flagResearch } from "/imports/api/research/methods";
import swal from "sweetalert2";

import { notify } from "/imports/modules/notifier";
import { flagDialog } from "/imports/modules/flagDialog";

Template.researchList.helpers({
  containerClasses() {
    return this.containerClass || "card-columns";
  },
  cardWrapperClasses() {
    return Template.parentData().cardWrapperClass || "";
  },
  limitChars(val) {
    return val && val.length > 50 ? val.slice(0, 50) + " ... " : val;
  },
  canEdit: function() {
    return this.createdBy === Meteor.userId();
  },
});

Template.researchList.events({
  "click #js-remove": function(event, _) {
    event.preventDefault();

    swal({
      text: `Are you sure you want to remove this research papaer? This action is not reversible.`,
      type: "warning",
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed.value) {
        removeResearch.call(
          {
            researchId: this._id
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

    flagDialog.call(this, flagResearch, "researchId");
  }
});
