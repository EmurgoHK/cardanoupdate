import "./projectCard.html";
import "./projectCard.scss";

import { Template } from "meteor/templating";

import {
  deleteProject,
  proposeNewData,
  flagProject
} from "/imports/api/projects/methods";
import swal from "sweetalert2";

import { notify } from "/imports/modules/notifier";

import { flagDialog } from "/imports/modules/flagDialog";

Template.projectCard.helpers({
  editURL() {
    const project = Template.currentData().project;
    if(project.createdBy === Meteor.userId()){
      return `/projects/${project._id}/edit`
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
});

Template.projectCard.events({
  "click .website": function(event, temlateInstance) {
    if ($(event.currentTarget).attr("href")) {
      return;
    }
    const project = Template.currentData().project;

    swal({
      text: TAPi18n.__('projects.view.no_web'),
      type: "warning",
      showCancelButton: true,
      input: "text"
    }).then(val => {
      if (val.value) {
        proposeNewData.call(
          {
            projectId: project._id,
            datapoint: "website",
            newData: val.value,
            type: "link"
          },
          (err, data) => {
            if (err) {
              notify(err.reason || err.message, "error");
            } else {
              notify(TAPi18n.__('projects.view.success_contrib'), "success");
            }
          }
        );
      }
    });
  },
  "click #js-remove": (event, templateInstance) => {
    event.preventDefault();
    const project = Template.currentData().project;
    swal({
      text: TAPi18n.__('projects.card.are_you_sure'),
      type: "warning",
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed.value) {
        deleteProject.call(
          {
            projectId: project._id
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
  "click .no-github"(event, _tpl) {
    event.preventDefault();
    swal({
      title: TAPi18n.__('projects.view.missing_repo'),
      text: TAPi18n.__('projects.view.missing_info'),
      type: "warning",
      cancelButtonColor: "#d33",
      confirmButtonText: TAPi18n.__('projects.view.ok')
    });
  },
  "click .flag-project": function(event, templateInstance) {
    event.preventDefault();

    flagDialog.call(Template.currentData().project, flagProject, "projectId");
  }
});
