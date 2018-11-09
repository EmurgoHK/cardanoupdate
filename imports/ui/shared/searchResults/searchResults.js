import "./searchResults.html";
import "./searchResults.scss";

import { Events } from '/imports/api/events/events';
import { Projects } from '/imports/api/projects/projects';
import { Learn } from '/imports/api/learn/learn';
import { Research } from '/imports/api/research/research';
import { socialResources } from '/imports/api/socialResources/socialResources';
import { Warnings } from '/imports/api/warnings/warnings';

Template.searchResults.onCreated(function() {
  this.sort = new ReactiveVar("date-desc");

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
        }, opts)).map(p => ({type: 'event', res: p, date: p.createdAt})));
      }

      if (data.types.includes('projects')) {
        res = res.concat((Projects.find({
          $or: [
            {description: regex}, 
            {headline: regex}, 
            {tags: regex}
          ],
        }, opts)).map(p => ({type: 'project', res: p, date: p.createdAt})));
      }

      if (data.types.includes('learn')) {
        res = res.concat((Learn.find({
          $or: [
            {content: regex}, 
            {title: regex}, 
            {summary: regex}, 
          ],
        }, opts)).map(p => ({type: 'learningResource', res: p, date: p.createdAt})));
      }

      if (data.types.includes('research')) {
        res = res.concat((Research.find({
          $or: [
            {abstract: regex}, 
            {headline: regex}, 
          ],
        }, opts)).map(p => ({type: 'research', res: p, date: p.createdAt})));
      }

      if (data.types.includes('socialResources')) {
        res = res.concat((socialResources.find({
          $or: [
            {Name: regex}, 
            {description: regex}, 
          ],
        }, opts)).map(p => ({type: 'socialResource', res: p, date: p.createdAt})));
      }
      
      if (data.types.includes('warnings')) {
        res = res.concat((Warnings.find({
          $or: [
            {summary: regex}, 
            {headline: regex},
            {tags: regex}, 
          ],
        }, opts)).map(p => ({type: 'warning', res: p, date: p.createdAt})));
      }
    } else {
      if (data.types.includes('events'))
        res = res.concat(Events.find({}, opts).map(p => ({type: 'event', res: p, date: p.createdAt})));
      
      if (data.types.includes('projects'))
        res = res.concat(Projects.find({}, opts).map(p => ({type: 'project', res: p, date: p.createdAt})));
        
      if (data.types.includes('learn'))
        res = res.concat(Learn.find({}, opts).map(p => ({type: 'learningResource', res: p, date: p.createdAt})));
      
      if (data.types.includes('research'))
        res = res.concat(Research.find({}, opts).map(p => ({type: 'research', res: p, date: p.createdAt})));

      if (data.types.includes('socialResources'))
        res = res.concat(socialResources.find({}, opts).map(p => ({type: 'socialResource', res: p, date: p.createdAt})));

      if (data.types.includes('warnings'))
        res = res.concat(Warnings.find({}, opts).map(p => ({type: 'warning', res: p, date: p.createdAt})));
    }
    Template.instance().results.set(res);
  })
})

Template.searchResults.helpers({
  results: () => {
    const tpl = Template.instance();
    const results = tpl.results.get();

    switch (tpl.sort.get()) {
      case "date-asc":
        return results.sort((a,b) => a.date - b.date);
      case "date-desc":
      default:
        return results.sort((a,b) => b.date - a.date);
    }
  },
  resultCount: () => Template.instance().results.get().length,

  isTypeOf: (res, type) => res.type === type,

  isDateAsc() {
    return Template.instance().sort.get() === "date-asc";
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
    if (templateInstance.sort.get() === 'date-desc') {
        templateInstance.sort.set('date-asc');
    } else {
        templateInstance.sort.set('date-desc');
    }
  },

  'click #add-new':  (event, templateInstance) => {
    event.preventDefault();

    Template.currentData().addNewCallback();
  },
});