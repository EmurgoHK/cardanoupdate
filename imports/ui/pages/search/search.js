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
        let q = FlowRouter.getQueryParam('q');

        const typeParam = FlowRouter.getQueryParam('type');
        let filters =  typeParam !== undefined ? typeParam.split('-') : [
            'projects',
            'events',
            'learn',
            'research',
            'warnings',
            'socialResources',
        ];

        this.subscribe('projects.search', q)
        this.subscribe('events.search', q);
        this.subscribe('learn.search', q);
        this.subscribe('research.search', q);
        this.subscribe('warnings.search', q);
        this.subscribe('socialResources.search', q);
       
        this.filters.set(filters);
    })
})

Template.search.helpers({
    recordsFound() {
        let events = Template.instance().filters.get().indexOf('events') !== -1 ? Events.find({}).count() : 0;
        let projects = Template.instance().filters.get().indexOf('projects') !== -1 ? Projects.find({}).count() : 0;
        let learn = Template.instance().filters.get().indexOf('learn') !== -1 ? Learn.find({}).count() : 0;
        let research = Template.instance().filters.get().indexOf('research') !== -1 ? Research.find({}).count() : 0;
        let socialResourcesCount = Template.instance().filters.get().indexOf('socialResources') !== -1 ? socialResources.find({}).count() : 0;
        let warnings = Template.instance().filters.get().indexOf('warnings') !== -1 ? Warnings.find({}).count() : 0;

        return events + projects + learn + research + socialResourcesCount + warnings;
    },
    events() {
        return Events.find({})
    },
    projects() {
        return Projects.find({})
    },
    learn() {
        return Learn.find({})
    },
    research() {
        return Research.find({})
    },
    socialResources() {
        return socialResources.find({})
    },
    warnings() {
        return Warnings.find({})
    },
    showProjects: () => Template.instance().filters.get().indexOf('projects') !== -1,
    projectsContainerClass: () => Template.instance().filters.get().indexOf('projects') !== -1 ? 'resultContainer' : 'shrinkToHidden',
    
    showEvents: () => Template.instance().filters.get().indexOf('events') !== -1,
    eventsContainerClass: () => Template.instance().filters.get().indexOf('events') !== -1 ? 'resultContainer' : 'shrinkToHidden',
    
    showLearn: () => Template.instance().filters.get().indexOf('learn') !== -1,
    learnContainerClass: () => Template.instance().filters.get().indexOf('learn') !== -1 ? 'resultContainer' : 'shrinkToHidden',
    
    showResearch: () => Template.instance().filters.get().indexOf('research') !== -1,
    researchContainerClass: () => Template.instance().filters.get().indexOf('research') !== -1 ? 'resultContainer' : 'shrinkToHidden',
    
    showWarnings: () => Template.instance().filters.get().indexOf('warnings') !== -1,
    warningsContainerClass: () => Template.instance().filters.get().indexOf('warnings') !== -1 ? 'resultContainer' : 'shrinkToHidden',
    
    showSocialResources: () => Template.instance().filters.get().indexOf('socialResources') !== -1,
    socialResourcesContainerClass: () => Template.instance().filters.get().indexOf('socialResources') !== -1 ? 'resultContainer' : 'shrinkToHidden',

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