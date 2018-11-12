import "./eventCard.html";
import "./eventCard.scss";

import { Template } from "meteor/templating";
import { deleteEvent, flagEvent } from "/imports/api/events/methods";
import { notify } from "/imports/modules/notifier";

import swal from "sweetalert2";
import moment from "moment";

import { flagDialog } from "/imports/modules/flagDialog";

Template.eventCard.helpers({
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
    const event = Template.currentData().event;
    if(event.createdBy === Meteor.userId()){
      return `/events/${event._id}/edit`
    }
    return false
  },
  eventLabel() {
    const event = Template.currentData().event;
    let now = moment();
    if (moment(event.start_date) > now && moment(event.end_date) > now) {
      return "upcoming-event";
    } else if (moment(event.start_date) <= now && now <= moment(event.end_date)) {
      return "ongoing-event";
    } else {
      return "past-event";
    }
  }
});

Template.eventCard.events({
  "click #js-remove": function(ev, _) {
    ev.preventDefault();

    const event = Template.currentData().event;
    swal({
      text: `Are you sure you want to remove this Event? This action is not reversible.`,
      type: "warning",
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed.value) {
        deleteEvent.call(
          {
            eventId: event._id
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

    flagDialog.call(Template.currentData().event, flagEvent, "eventId");
  }
});
