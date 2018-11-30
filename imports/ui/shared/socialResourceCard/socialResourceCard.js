import "./socialResourceCard.html";
import "./socialResourceCard.scss";

import { Template } from "meteor/templating";
import { deleteSocialResource, flagSocialResource } from "/imports/api/socialResources/methods";

import { flagDialog } from "/imports/modules/flagDialog";
import swal from "sweetalert2";

Template.socialResourceCard.helpers({
  editURL() {
    const socialResource = Template.currentData().socialResource;
    if(socialResource.createdBy === Meteor.userId()){
      return `/community/${socialResource._id}/edit`;
    }
    return false;
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
    if (transformer) return transformer(limitedText);
    return limitedText;
  },
  transform(text) {
    const transformer = Template.currentData().textTransformer;
    return transformer ? transformer(text) : text;
  },
  translationsWithHref() {
    const data = Template.currentData();
    return data.translations.filter(t => t.id !== data.socialResource._id).map((t) => ({language: t.language, href: `/community/${t.id}`}));
  },
});

Template.socialResourceCard.events({
  "click #js-remove": function(event, _) {
    event.preventDefault();

    const socialResource = Template.currentData().socialResource;
    swal({
      text: TAPi18n.__('community.card.are_you_sure'),
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
              notify(TAPi18n.__(err.reason || err.message), "error");
            }
          }
        );
      }
    });
  },

  "click .flag-socialResource": function(event, templateInstance) {
    event.preventDefault();

    flagDialog.call(Template.currentData().socialResource, flagSocialResource, "socialResourceId");
  }
});
