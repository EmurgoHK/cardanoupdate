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
    this.autorun(() => {

        let q = FlowRouter.getQueryParam('q');

        this.subscribe('projects.search', q)
        this.subscribe('events.search', q)
        this.subscribe('learn.search', q)
        this.subscribe('research.search', q)
        this.subscribe('warnings.search', q)
        this.subscribe('socialResources.search', q)
    })
})

Template.search.helpers({
    recordsFound() {
        let events = Events.find({}).count();
        let projects = Projects.find({}).count();
        let learn = Learn.find({}).count();
        let research = Research.find({}).count();
        let socialResourcesCount = socialResources.find({}).count();
        let warnings = Warnings.find({}).count();

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
    query() {
        return FlowRouter.getQueryParam('q')
    },
})

Template.search.events({
    'click #projectCheckbox': (event, _) => {
        $(".projectsContainer").fadeToggle();
    },
    'click #eventsCheckbox': (event, _) => {
        $(".eventsContainer").fadeToggle();
    },
    'click #learnCheckbox': (event, _) => {
        $(".learnContainer").fadeToggle();
    },
    'click #researchCheckbox': (event, _) => {
        $(".researchContainer").fadeToggle();
    },
    'click #scamsCheckbox': (event, _) => {
        $(".scamsContainer").fadeToggle();
    },
    'click #communityCheckbox': (event, _) => {
        $(".communityContainer").fadeToggle();
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