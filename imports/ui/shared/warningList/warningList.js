import "./warningList.html";
import "./warningList.scss";

import { Template } from "meteor/templating";
import {
  deleteWarning,
  proposeNewDataWarning,
  flagWarning
} from "/imports/api/warnings/methods";
import swal from "sweetalert2";
import { notify } from "/imports/modules/notifier";

Template.warningList.onCreated(function() {
});
Template.warningList.helpers({
  containerClasses() {
    return this.containerClass || "card-columns";
  },
  cardWrapperClasses() {
    return Template.parentData().cardWrapperClass || "";
  },
  canEdit() {
    return this.createdBy === Meteor.userId();
  },
  limitChars(val) {
    return val && val.length > 50 ? val.slice(0, 50) + " ... " : val;
  },
});
Template.warningList.events({
  // Remove comments if user is allowed to propose changes
  /*
    'click .github': function(event, temlateInstance) {
        if ($(event.currentTarget).attr('href')) {
            return
        }
         swal({
            text: `GitHub repo is not available. If you know this information, please contribute below:`,
            type: 'warning',
            showCancelButton: true,
            input: 'text'
        }).then(val => {
            if (val.value) {
                proposeNewDataWarning.call({
                    projectId: this._id,
                    datapoint: 'github_url',
                    newData: val.value,
                    type: 'link'
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    } else {
                        notify('Successfully contributed.', 'success')
                    }
                })
            }
        })
    },
    'click .website': function(event, temlateInstance) {
        if ($(event.currentTarget).attr('href')) {
            return
        }
         swal({
            text: `Website is not available. If you know this information, please contribute below:`,
            type: 'warning',
            showCancelButton: true,
            input: 'text'
        }).then(val => {
            if (val.value) {
                proposeNewDataWarning.call({
                    projectId: this._id,
                    datapoint: 'website',
                    newData: val.value,
                    type: 'link'
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    } else {
                        notify('Successfully contributed.', 'success')
                    }
                })
            }
        })
    },
    */
  "click #js-remove": function(event, _) {
    event.preventDefault();

    swal({
      text: `Are you sure you want to remove this Project? This action is not reversible.`,
      type: "warning",
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed.value) {
        deleteWarning.call(
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
  },
  "click .projectWarning"(event, _tpl) {
    event.preventDefault();
    swal({
      title: "Missing source repository",
      text: "This project does't contain any link to the source repository",
      type: "warning",
      cancelButtonColor: "#d33",
      confirmButtonText: "Okay"
    });
  },
  "click .flag-warning": function(event, templateInstance) {
    event.preventDefault();
    swal({
      title: "Why are you flagging this?",
      input: "text",
      showCancelButton: true,
      inputValidator: value => {
        return !value && "You need to write a valid reason!";
      }
    }).then(data => {
      if (data.value) {
        flagWarning.call(
          {
            projectId: this._id,
            reason: data.value
          },
          (err, data) => {
            if (err) {
              notify(err.reason || err.message, "error");
            } else {
              notify(
                "Successfully flagged. Moderators will decide what to do next.",
                "success"
              );
            }
          }
        );
      }
    });
  }
});
