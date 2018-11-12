import "./socialResourceCard.html";
import "./socialResourceCard.scss";

import { Template } from "meteor/templating";
import { deleteSocialResource } from "/imports/api/socialResources/methods";

import swal from "sweetalert2";

Template.socialResourceCard.helpers({
  canEdit() {
    return Template.currentData().socialResource.createdBy === Meteor.userId();
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
  },
  limitChars(val) {
    const limitedText = val && val.length > 50 ? val.slice(0, 50) + " ... " : val;
    const transformer = Template.currentData().textTransformer;
    console.log(Template.currentData(), transformer(limitedText));
    if (transformer) return transformer(limitedText);
    return limitedText;
  },
  transform(text) {
    const transformer = Template.currentData().textTransformer;
    return transformer ? transformer(text) : text;
  },
});

Template.socialResourceCard.events({
  "click #js-remove": function(event, _) {
    event.preventDefault();

    const socialResource = Template.currentData().socialResource;
    swal({
      text: `Are you sure you want to remove this Project? This action is not reversible.`,
      type: "warning",
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed.value) {
        deleteSocialResource.call(
          {
            projectId: socialResource._id
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
