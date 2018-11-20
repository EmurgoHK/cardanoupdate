import "./searchResults.html";
import "./searchResults.scss";

import { Events } from '/imports/api/events/events';
import { Projects } from '/imports/api/projects/projects';
import { Learn } from '/imports/api/learn/learn';
import { Research } from '/imports/api/research/research';
import { socialResources } from '/imports/api/socialResources/socialResources';
import { Warnings } from '/imports/api/warnings/warnings';

import moment from "moment";

Template.searchResults.onCreated(function() {
  this.sort = new ReactiveVar("date-desc");
  this.titleSort = new ReactiveVar("");

  this.results = new ReactiveVar({ count: () => 0 });
});

Template.searchResults.onRendered(function() {
  this.autorun(() => {
    const data = Template.currentData();

    const opts = {};

    // Limit number of results/type
    if (data.typeLimit)
      opts.limit = data.typeLimit;

    let res = [];
    if (data.searchTerm) {
      const regex = new RegExp(data.searchTerm.replace(/ /g, '|'), 'ig');

      if (data.types.includes('events')) {
        res = res.concat((Events.find({
          $or: [
            {description: regex}, 
            {headline: regex}, 
            {location: regex}
          ],
        }, opts)).map(p => ({type: 'event', res: p, date: p.createdAt, titleText: p.headline})));
      }

      if (data.types.includes('projects')) {
        res = res.concat((Projects.find({
          $or: [
            {description: regex}, 
            {headline: regex}, 
            {tags: regex}
          ],
        }, opts)).map(p => ({type: 'project', res: p, date: p.createdAt, titleText: p.headline})));
      }

      if (data.types.includes('learn')) {
        res = res.concat((Learn.find({
          $or: [
            {content: regex}, 
            {title: regex}, 
            {summary: regex}, 
          ],
        }, opts)).map(p => ({type: 'learningResource', res: p, date: p.createdAt, titleText: p.title})));
      }

      if (data.types.includes('research')) {
        res = res.concat((Research.find({
          $or: [
            {abstract: regex}, 
            {headline: regex}, 
          ],
        }, opts)).map(p => ({type: 'research', res: p, date: p.createdAt, titleText: p.headline})));
      }

      if (data.types.includes('socialResources')) {
        res = res.concat((socialResources.find({
          $or: [
            {Name: regex}, 
            {description: regex}, 
          ],
        }, opts)).map(p => ({type: 'socialResource', res: p, date: p.createdAt, titleText: p.name})));
      }
      
      if (data.types.includes('warnings')) {
        res = res.concat((Warnings.find({
          $or: [
            {summary: regex}, 
            {headline: regex},
            {tags: regex}, 
          ],
        }, opts)).map(p => ({type: 'warning', res: p, date: p.createdAt, titleText: p.headline})));
      }
    } else {
      const now = moment().utc().format('YYYY-MM-DD[T]HH:mm');
      if (data.types.includes('events'))
        res = res.concat(Events.find(data.hidePastEvents ? {end_date: {$gt: now}} : {}, opts).map(p => ({type: 'event', res: p, date: p.createdAt, titleText: p.headline})));
      
      if (data.types.includes('projects'))
        res = res.concat(Projects.find({}, opts).map(p => ({type: 'project', res: p, date: p.createdAt, titleText: p.headline})));
        
      if (data.types.includes('learn'))
        res = res.concat(Learn.find({}, opts).map(p => ({type: 'learningResource', res: p, date: p.createdAt, titleText: p.title})));
      
      if (data.types.includes('research'))
        res = res.concat(Research.find({}, opts).map(p => ({type: 'research', res: p, date: p.createdAt})));

      if (data.types.includes('socialResources'))
        res = res.concat(socialResources.find({}, opts).map(p => ({type: 'socialResource', res: p, date: p.createdAt, titleText: p.name})));

      if (data.types.includes('warnings'))
        res = res.concat(Warnings.find({}, opts).map(p => ({type: 'warning', res: p, date: p.createdAt, titleText: p.headline})));
    }
    Template.instance().results.set(res);
  })
})

Template.searchResults.helpers({
  results: () => {
    const tpl = Template.instance();
    let results = tpl.results.get();
    
    if (tpl.titleSort.get()) {
      switch (tpl.titleSort.get()) { //sort by titles
        case "title-asc":
          return results.sort((a,b) => a.titleText.localeCompare(b.titleText));
        case "title-desc":
          return results.sort((a,b) => b.titleText.localeCompare(a.titleText));
      }
    } else { // we only need to sort by date if the user has not selected sort by title
      switch (tpl.sort.get()) { //sort by date
        case "date-asc":
          return results.sort((a,b) => a.date - b.date);
        case "date-desc":
        default:
          return results.sort((a,b) => b.date - a.date);
      }
    }
  },

  resultCount: () => Template.instance().results.get().length,

  isTypeOf: (res, type) => res.type === type,

  isDateAsc(val) {
    // we must check if the title sort is active. if the title sort is active we must not show asc or desc icons on date.
    if (Template.instance().titleSort.get() == '') return Template.instance().sort.get() === val; 
  },
  
  isTitleAsc(val) {
      return Template.instance().titleSort.get() === val
  },

  highlighter(){
    let searchVal = Template.currentData().searchTerm;
    return (text) => {
      return searchVal && text ? 
        new Handlebars.SafeString(text.replace(RegExp('('+ searchVal.split(" ").join('|') + ')', 'img'), '<span class="SearchMarker" >$1</span>')) :
        text;
    };
  },
});

Template.searchResults.events({
  'click #sort-date': (event, templateInstance) => {
    event.preventDefault()

    // if the user clicks the date sort button we need to reset the sort by title
    templateInstance.titleSort.set('');

    if (templateInstance.sort.get() === 'date-desc') {
        templateInstance.sort.set('date-asc');
    } else {
        templateInstance.sort.set('date-desc');
    }
  },

  'click #sort-title': (event, templateInstance) => {
    event.preventDefault()

    if (templateInstance.titleSort.get() === '') {
        templateInstance.titleSort.set('title-asc');
    } else if (templateInstance.titleSort.get() === 'title-asc') {
        templateInstance.titleSort.set('title-desc');
    } else {
      templateInstance.titleSort.set('');
    }
  },

  'click #add-new':  (event, templateInstance) => {
    event.preventDefault();

    Template.currentData().addNewCallback();
  },
});