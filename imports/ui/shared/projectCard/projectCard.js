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
    return val && val.length > 50 ? val.slice(0, 50) + " ... " : val;
  }
});

Template.projectCard.events({
  "click .website": function(event, temlateInstance) {
    if ($(event.currentTarget).attr("href")) {
      return;
    }
    const project = Template.currentData().project;

    swal({
      text: `Website is not available. If you know this information, please contribute below:`,
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
              notify("Successfully contributed.", "success");
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
      text: `Are you sure you want to remove this Project? This action is not reversible.`,
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
      title: "Missing source repository",
      text: "This project does't contain any link to the source repository",
      type: "warning",
      cancelButtonColor: "#d33",
      confirmButtonText: "Okay"
    });
  },
  "click .flag-project": function(event, templateInstance) {
    event.preventDefault();

    flagDialog.call(Template.currentData().project, flagProject, "projectId");
  }
});
