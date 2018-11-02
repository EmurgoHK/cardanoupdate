import "./eventList.html";
import "./eventList.scss";

import { Template } from "meteor/templating";
import { deleteEvent, flagEvent } from "/imports/api/events/methods";
import { notify } from "/imports/modules/notifier";

import swal from "sweetalert2";
import moment from "moment";

import { flagDialog } from "/imports/modules/flagDialog";

Template.eventList.helpers({
  containerClasses() {
    return this.containerClass || "card-columns";
  },
  cardWrapperClasses() {
    return Template.parentData().cardWrapperClass || "";
  },
  limitChars(val) {
    return val && val.length > 50 ? val.slice(0, 50) + " ... " : val;
  },
  editURL() {
    if(this.createdBy === Meteor.userId()){
      return `/events/${this._id}/edit`
    }
    return false
  },
  eventLabel() {
    let now = moment();
    if (moment(this.start_date) > now && moment(this.end_date) > now) {
      return "upcoming-event";
    } else if (moment(this.start_date) <= now && now <= moment(this.end_date)) {
      return "ongoing-event";
    } else {
      return "past-event";
    }
  }
});

Template.eventList.events({
  "click #js-remove": function(event, _) {
    event.preventDefault();

    swal({
      text: `Are you sure you want to remove this Event? This action is not reversible.`,
      type: "warning",
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed.value) {
        deleteEvent.call(
          {
            eventId: this._id
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
  "click .flag-event": function(event, templateInstance) {
    event.preventDefault();

    flagDialog.call(this, flagEvent, "eventId");
  }
});
