import "./tag.html";

import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";

import { Projects } from "/imports/api/projects/projects";
import { Warnings } from "/imports/api/warnings/warnings";
import { Learn } from "/imports/api/learn/learn";
import { socialResources } from "/imports/api/socialResources/socialResources";

Template.tags.onCreated(function() {
  this.sort = new ReactiveVar("date-desc");

  // Get the queryparam defaulting to "", splitting and mapping. An empty param will produce an empty array.
  const searchText = FlowRouter.getQueryParam("search") || "";
  const inputTags = searchText
    .split(",")
    .map(txt => txt.trim().toUpperCase())
    .filter(a => a.length > 0);
  this.searchFilter = new ReactiveVar(inputTags);

  this.autorun(() => {
    this.subscribe("projects");
    this.subscribe("warnings");
    this.subscribe("learn");
    this.subscribe("socialResources");
  });
});

Template.tags.onRendered(function() {
  // We set the value of the searchbox here, to avoid updating it later while the user is typing
  const tpl = Template.instance();
  let searchTags = tpl.searchFilter.get();
  
  tpl.$("#searchBox").val(searchTags.join(', '));
});

Template.tags.helpers({
  projects() {
    let searchTags = Template.instance().searchFilter.get();

    // Check if user has searched for something
    if (searchTags && searchTags.length > 0) {
      return Projects.find({
        $and: searchTags.map(tagName => ({
          tags: {
            $elemMatch: { name: tagName }
          }
        }))
      });
    } else {
      return Projects.find({});
    }
  },
  warnings() {
    let searchTags = Template.instance().searchFilter.get();

    // Check if user has searched for something
    if (searchTags && searchTags.length > 0) {
      return Warnings.find({
        $and: searchTags.map(tagName => ({
          tags: {
            $elemMatch: { name: tagName }
          }
        }))
      });
    } else {
      return Warnings.find({});
    }
  },
  learn() {
    let searchTags = Template.instance().searchFilter.get();

    // Check if user has searched for something
    if (searchTags && searchTags.length > 0) {
      return Learn.find({
        $and: searchTags.map(tagName => ({
          tags: {
            $elemMatch: { name: tagName }
          }
        }))
      });
    } else {
      return Learn.find({});
    }
  },
  socialResources() {
    let searchTags = Template.instance().searchFilter.get();

    // Check if user has searched for something
    if (searchTags && searchTags.length > 0) {
      return socialResources.find({
        $and: searchTags.map(tagName => ({
          tags: {
            $elemMatch: { name: tagName }
          }
        }))
      });
    } else {
      return socialResources.find({});
    }
  }
});

Template.tags.events({
  "keyup #searchBox": function(event, templateInstance) {
    event.preventDefault();

    const searchText = templateInstance.$("#searchBox").val();
    const inputTags = searchText
      .split(",")
      .map(txt => txt.trim().toUpperCase())
      .filter(a => a.length > 0);

    FlowRouter.setParams({ searchText: inputTags.join(",") });

    templateInstance.searchFilter.set(inputTags);
  }
});
