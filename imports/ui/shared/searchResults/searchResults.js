import "./searchResults.html";
import "./searchResults.scss";

import { Events } from "/imports/api/events/events";
import { Projects } from "/imports/api/projects/projects";
import { Learn } from "/imports/api/learn/learn";
import { Research } from "/imports/api/research/research";
import { socialResources } from "/imports/api/socialResources/socialResources";
import { Warnings } from "/imports/api/warnings/warnings";

import moment from "moment";
import { TranslationGroups } from "../../../api/translationGroups/translationGroups";
import { Meteor } from "meteor/meteor";

Template.searchResults.onCreated(function() {
  // this.sort = new ReactiveVar("date-desc"); // state of the sort by date
  // this.titleSort = new ReactiveVar(""); // state of the sort by title
  this.sortOptions = new ReactiveVar({date: 'desc'})

  this.results = new ReactiveVar({ count: () => 0 });

  this.subscribe("translationGroups");
});

/**
 * Adds a new filter into a query object with $and
 * @param {*} obj Original query object
 * @param {*} newFilter Filter to add
 */
function addFilter(obj, newFilter) {
  if (obj.$and) {
    obj.$and.push(newFilter);
  } else if (Object.keys(obj).length > 0) {
    obj = {
      $and: [
        obj,
        newFilter,
      ],
    };
  } else {
    obj = newFilter;
  }
  return obj;
}

/**
 * Returns the query object that corresponds to the passed parameters
 * @param {String} contentType Type of the content to filter
 * @param {Regex} regex Regex to filter content
 * @param {String[]} languages Language codes to filter for - pass undefined to allow all
 * @param {*} data Data object with other extra params
 */
function getFilters(contentType, regex, languages, data) {
  let filter = {};
  if (regex) { // If we have a regex we filter for it in contentType dependant fields
    let orFilters = undefined;
    switch (contentType) {
      case "event":
        orFilters = [
          { description: regex },
          { headline: regex },
          { location: regex }
        ];
        break;
      case "project":
        orFilters = [
          { description: regex },
          { headline: regex },
          { tags: regex }
        ];
        break;
      case "learningResource":
        orFilters = [
          { content: regex }, 
          { title: regex }, 
          { summary: regex },
        ];
        break;
      case "research":
        orFilters = [
          { abstract: regex }, 
          { headline: regex }
        ];
        break;
      case "socialResource":
        orFilters = [
          { Name: regex }, 
          { description: regex }
        ];
        break;
      case "warning":
        orFilters = [
          { summary: regex }, 
          { headline: regex }, 
          { tags: regex }];
        break;
      default:
        throw new Error("UnknownContentType" + contentType);
    }
    filter = addFilter(filter, {$or: orFilters});
  }
  if (languages) { // We filter for language if we have something to filter for
    const langFilter = {language: {$in: languages}}
    filter = addFilter(filter, 
      languages.includes('en') 
        ? {$or: [langFilter, {language: {$exists: false}}]} // This is necessary for compatibility with old content that don't have the language field set.
        : langFilter);
  }
  if (contentType === "event" && data && data.hidePastEvents) { // We optionally want to hide past events
    const now = moment()
      .utc()
      .format("YYYY-MM-DD[T]HH:mm");
    filter = addFilter(filter, {end_date: {$gt: now}});
  }
  return filter;
}

Template.searchResults.onRendered(function() {
  this.autorun(() => {
    const data = Template.currentData();

    const opts = {};

    // Limit number of results/type
    if (data.typeLimit) opts.limit = data.typeLimit;

    let res = [];
    const regex = data.searchTerm ? new RegExp(data.searchTerm.replace(/ /g, "|"), "ig") : undefined;

    if (data.types.includes("events")) {
      res = res.concat(
        Events.find(getFilters("event", regex, data.languages, data), opts).map(p => ({
          type: "event",
          res: p,
          date: p.createdAt,
          titleText: p.headline // use the headline field of events as title
        }))
      );
    }

    if (data.types.includes("projects")) {
      res = res.concat(
        Projects.find(getFilters("project", regex, data.languages, data), opts).map(p => ({
          type: "project",
          res: p,
          date: p.createdAt,
          titleText: p.headline // use the headline field of projects as title
        }))
      );
    }

    if (data.types.includes("learn")) {
      res = res.concat(
        Learn.find(getFilters("learningResource", regex, data.languages, data), opts).map(p => ({
          type: "learningResource",
          res: p,
          date: p.createdAt,
          titleText: p.title // use the title field of learn as title
        }))
      );
    }

    if (data.types.includes("research")) {
      res = res.concat(
        Research.find(getFilters("research", regex, data.languages, data), opts).map(p => ({
          type: "research",
          res: p,
          date: p.createdAt,
          titleText: p.headline // use the headline field of research as title
        }))
      );
    }

    if (data.types.includes("socialResources")) {
      res = res.concat(
        socialResources.find(getFilters("socialResource", regex, data.languages, data), opts).map(p => ({
            type: "socialResource",
            res: p,
            date: p.createdAt,
            titleText: p.Name // use the Name field of social resources as title
          }))
      );
    }

    if (data.types.includes("warnings")) {
      res = res.concat(
        Warnings.find(getFilters("warning", regex, data.languages, data), opts).map(p => ({
          type: "warning",
          res: p,
          date: p.createdAt,
          titleText: p.headline
        }))
      );
    }

    res.forEach(curr => {
      const group = TranslationGroups.findOne({
        translations: { $elemMatch: { id: curr.res._id } }
      });
      curr.translations = (group && group.translations) || [];
    });

    if (data.doLanguageGrouping) {
      const uiLang = TAPi18n.getLanguage();
      // We drop a result if it has a translation on the ui language also in the results
      // These will be shown in the more menu of the result cards
      res = res.filter(
        curr =>
          !curr.translations || // It has translations AND
          !curr.translations.some(
            (
              t // It has a translation that is:
            ) =>
              t.language === uiLang && // same language as the UI AND
              t.id !== curr.res._id && // it's not the current one AND
              res.some(c => t.id === c.res._id) // we find it in the results
          )
      );
    }

    Template.instance().results.set(res);
  });
});

Template.searchResults.helpers({
  results: () => {
    const tpl = Template.instance();
    let results = tpl.results.get();
    const sortOptions = tpl.sortOptions.get()
    if (sortOptions) {
      results = results.sort(function (a, b) {
        const dateValue = (sortOptions.date == 'asc') ? (a.date - b.date) : (b.date - a.date)
        if(sortOptions.title) {
          if (sortOptions.title == 'asc') return a.titleText && b.titleText ? (a.titleText.localeCompare(b.titleText) || dateValue) : 0
          else return b.titleText && a.titleText ? (b.titleText.localeCompare(a.titleText) || dateValue) : 0
        } else {
          return (sortOptions.date == 'asc') ? (a.date - b.date) : (b.date - a.date);
        }
      })
    }
    return results
  },

  subsReady() {
    return FlowRouter.subsReady()
  },

  resultCount: () => Template.instance().results.get().length,

  isTypeOf: (res, type) => res.type === type,

  isDateAsc(val) {
    const sortOptions = Template.instance().sortOptions.get()
    if (sortOptions && sortOptions.date) return sortOptions.date == val
    // // we must check if the title sort is active. if the title sort is active we must not show asc or desc icons on date.
    // if (Template.instance().titleSort.get() == "")
    //   return Template.instance().sort.get() === val;
  },

  isTitleAsc(val) {
    const sortOptions = Template.instance().sortOptions.get()
    if (sortOptions && sortOptions.title) return sortOptions.title == val
    // return Template.instance().titleSort.get() === val;
  },

  highlighter() {
    let searchVal = Template.currentData().searchTerm;
    return text => {
      return searchVal && text
        ? new Handlebars.SafeString(
            text.replace(
              RegExp("(" + searchVal.split(" ").join("|") + ")", "img"),
              '<span class="SearchMarker" >$1</span>'
            )
          )
        : text;
    };
  }
});

Template.searchResults.events({
  "click #sort-date": (event, templateInstance) => {
    event.preventDefault();
    const sortOptions = templateInstance.sortOptions.get()

    if (sortOptions) {
      if (sortOptions['date'] == 'asc') sortOptions['date'] = 'desc'
      else if (sortOptions['date'] == 'desc') sortOptions['date'] = 'asc'
      else sortOptions['date'] = 'asc'
    }
    templateInstance.sortOptions.set(sortOptions);
  },

  "click #sort-title": (event, templateInstance) => {
    event.preventDefault();
    const sortOptions = templateInstance.sortOptions.get()

    if (sortOptions) {
      if (sortOptions['title'] == 'asc') sortOptions['title'] = 'desc'
      else if (sortOptions['title'] == 'desc') delete sortOptions['title']
      else sortOptions['title'] = 'asc'
    }
    templateInstance.sortOptions.set(sortOptions);
  },

  "click #add-new": (event, templateInstance) => {
    event.preventDefault();

    Template.currentData().addNewCallback();
  }
});
