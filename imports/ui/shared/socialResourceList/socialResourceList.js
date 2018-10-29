import "./socialResourceList.html";

import { Template } from "meteor/templating";
import { deleteSocialResource } from "/imports/api/socialResources/methods";

import swal from "sweetalert2";

Template.socialResourceList.helpers({
  canEdit() {
    return this.createdBy === Meteor.userId();
  },

  resourceUrlClass(resourceUrlType) {
    switch (resourceUrlType) {
      case "TELEGRAM":
        return "fab fa-telegram";
      case "FACEBOOK":
        return "fab fa-facebook";
      case "TWITTER":
        return "fab fa-twitter";
      case "DISCORD":
        return "fab fa-discord";
      case "SLACK":
        return "fab fa-slack";
      case "GITTER":
        return "fab fa-gitter";
      default:
        return "fas fa-external-link-alt";
    }
  }
});

Template.socialResourceList.events({
  "click #js-remove": function(event, _) {
    event.preventDefault();

    swal({
      text: `Are you sure you want to remove this Project? This action is not reversible.`,
      type: "warning",
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed.value) {
        deleteSocialResource.call(
          {
            projectId: this._id
          },
          (err, data) => {
            if (err) {
              notify(err.reason || err.message, "error");
            }
          }
        );
      }
    });
  }
});
