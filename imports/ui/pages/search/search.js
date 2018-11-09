import './search.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Projects } from '/imports/api/projects/projects'
import { Events } from '/imports/api/events/events'
import { Research } from '/imports/api/research/research'
import { Learn } from '/imports/api/learn/learn'
import { socialResources } from '/imports/api/socialResources/socialResources'
import { Warnings } from '/imports/api/warnings/warnings'
import './search.scss'

Template.search.onCreated(function() {
    this.filters= new ReactiveVar([]);
    this.autorun(() => {
        const typeParam = FlowRouter.getQueryParam('type');
        let filters =  typeParam !== undefined ? typeParam.split('-') : [
            'projects',
            'events',
            'learn',
            'research',
            'warnings',
            'socialResources',
        ];

        this.filters.set(filters);
    });
})

Template.search.helpers({
    showProjects: () => Template.instance().filters.get().indexOf('projects') !== -1,
    
    showEvents: () => Template.instance().filters.get().indexOf('events') !== -1,
    
    showLearn: () => Template.instance().filters.get().indexOf('learn') !== -1,
    
    showResearch: () => Template.instance().filters.get().indexOf('research') !== -1,
    
    showWarnings: () => Template.instance().filters.get().indexOf('warnings') !== -1,
    
    showSocialResources: () => Template.instance().filters.get().indexOf('socialResources') !== -1,

    resultArgs: () => {
        return {
            searchTerm: FlowRouter.getQueryParam('q'),
            types: Template.instance().filters.get(),
            displayTypeLabel: true,
        }
    },
    query() {
        return FlowRouter.getQueryParam('q')
    },
    SearchMarker(text){let searchVal = FlowRouter.getQueryParam('q');
      return searchVal&&text?new Handlebars.SafeString(text.replace(RegExp('('+ searchVal.split(" ").join('|') + ')', 'img'), '<span class="SearchMarker" >$1</span>')):text;}
})

Template.search.events({
    'click #projectCheckbox': (event, templateInstance) => {
        toggleFilter(templateInstance, 'projects');
    },
    'click #eventsCheckbox': (event, templateInstance) => {
        toggleFilter(templateInstance, 'events');
    },
    'click #learnCheckbox': (event, templateInstance) => {
        toggleFilter(templateInstance, 'learn');
    },
    'click #researchCheckbox': (event, templateInstance) => {
        toggleFilter(templateInstance, 'research');
    },
    'click #scamsCheckbox': (event, templateInstance) => {
        toggleFilter(templateInstance, 'warnings');
    },
    'click #communityCheckbox': (event, templateInstance) => {
        toggleFilter(templateInstance, 'socialResources');
    },
    'click #searchButton, submit': (event, templateInstance) => {
        event.preventDefault();

        let searchQ = $('.searchInput').val()
        $('#searchHeader').val(searchQ);


        let queryParam = { q: searchQ }
        let path = FlowRouter.path('/search', {}, queryParam)

        FlowRouter.go(path)

    },
})

function toggleFilter(templateInstance, filter) {
    const filters = templateInstance.filters.get();
    const index = filters.indexOf(filter);
    
    // We push filter in if it wasn't present and remove it if it was
    if (index === -1)
        filters.push(filter)
    else 
        filters.splice(index, 1);
    
    templateInstance.filters.set(filters);

    // We save to a queryparam to preserve it after refresh
    // It's sorted to have consistent urls for filters
    FlowRouter.setQueryParams({'type': filters.sort().join('-')});
}