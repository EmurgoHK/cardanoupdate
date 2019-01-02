import "./tag.html";

import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";

import { Projects } from "/imports/api/projects/projects";
import { Events } from "/imports/api/events/events";
import { Warnings } from "/imports/api/warnings/warnings";
import { Learn } from "/imports/api/learn/learn";
import { socialResources } from "/imports/api/socialResources/socialResources";
import { TranslationGroups } from "/imports/api/translationGroups/translationGroups";

Template.tags.onCreated(function() {
  this.sort = new ReactiveVar("date-desc");

  // Get the queryparam defaulting to "", splitting and mapping. An empty param will produce an empty array.
  const searchText = FlowRouter.getQueryParam("search") || "";
  const inputTags = searchText
    .split(",")
    .map(txt => txt.trim().toUpperCase())
    .filter(a => a.length > 0);
  this.searchFilter = new ReactiveVar(inputTags);

  this.projects = new ReactiveVar();
  this.events = new ReactiveVar();
  this.warnings = new ReactiveVar();
  this.learn = new ReactiveVar();
  this.socialResources = new ReactiveVar();

  this.autorun(() => {
    this.subscribe("projects");
    this.subscribe("events");
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
  this.autorun(() => {
    let searchTags = Template.instance().searchFilter.get();

    // Check if user has searched for something
    if (searchTags && searchTags.length > 0) {
      this.projects.set(Projects.find({
        $and: searchTags.map(tagName => ({
          tags: {
            $elemMatch: { name: tagName }
          }
        }))
      }));

      this.events.set(Projects.find({
        $and: searchTags.map(tagName => ({
          tags: {
            $elemMatch: { name: tagName }
          }
        }))
      }));

      this.warnings.set(Warnings.find({
        $and: searchTags.map(tagName => ({
          tags: {
            $elemMatch: { name: tagName }
          }
        }))
      }));

      this.learn.set(Learn.find({
        $and: searchTags.map(tagName => ({
          tags: {
            $elemMatch: { name: tagName }
          }
        }))
      }));

      this.socialResources.set(socialResources.find({
        $and: searchTags.map(tagName => ({
          tags: {
            $elemMatch: { name: tagName }
          }
        }))
      }));
    } else {
      this.projects.set(Projects.find({}));
      this.events.set(Events.find({}));
      this.warnings.set(Warnings.find({}));
      this.learn.set(Learn.find({}));
      this.socialResources.set(socialResources.find({}));
    }
  });
});

Template.tags.helpers({
  projects() {
    return Template.instance().projects.get();
  },
  hasProjects() {
    const projects = Template.instance().projects.get();
    return projects && projects.count() > 0;
  },
  events() {
    return Template.instance().events.get();
  },
  hasEvents() {
    const events = Template.instance().events.get();
    return events && events.count() > 0;
  },
  warnings() {
    return Template.instance().warnings.get();
  },
  hasWarnings() {
    const warnings = Template.instance().warnings.get();
    return warnings && warnings.count() > 0;
  },
  learn() {
    return Template.instance().learn.get();
  },
  hasLearn() {
    const learn = Template.instance().learn.get();
    return learn && learn.count() > 0;
  },
  socialResources() {
    return Template.instance().socialResources.get();
  },
  hasSocialResources() {
    const socialResources = Template.instance().socialResources.get();
    return socialResources && socialResources.count() > 0;
  },
  hasAny() {
    const projects = Template.instance().projects.get();
    const events = Template.instance().events.get();
    const warnings = Template.instance().warnings.get();
    const learn = Template.instance().learn.get();
    const socialResources = Template.instance().socialResources.get();

    return (projects && projects.count() > 0) ||
           (events && events.count() > 0) ||
           (warnings && warnings.count() > 0) ||
           (learn && learn.count() > 0) ||
           (socialResources && socialResources.count() > 0);
  },
  translationsList() {
    const _id = this._id
    const group = TranslationGroups.findOne({
      translations: { $elemMatch: { id: _id } }
    });
    return (group && group.translations) || [];
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

    FlowRouter.setQueryParams({ search: inputTags.join(",") });

    templateInstance.searchFilter.set(inputTags);
  },
  "blur #searchBox": function(event, templateInstance) {
    const searchText = templateInstance.$("#searchBox").val();
    const inputTags = searchText
      .split(",")
      .map(txt => txt.trim().toUpperCase())
      .filter(a => a.length > 0);

    FlowRouter.setQueryParams({ search: inputTags.join(",") });

    templateInstance.searchFilter.set(inputTags);
  },
});
