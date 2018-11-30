import './projects.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

const CHUNK_SIZE = 3

Template.projects.onCreated(function () {
    this.searchFilter = new ReactiveVar(undefined);
})

Template.projects.helpers({
    chunkSize () {
        return CHUNK_SIZE + 1
    },
    searchArgs() {
        const instance = Template.instance();
        return {
            placeholder:"Search projects",
            type: 'projects',
            onChange: (newTerm) => instance.searchFilter.set(newTerm),
        }
    },
    resultArgs() {
        return {
            types: ['projects'],
            searchTerm: Template.instance().searchFilter.get(),
            doLanguageGrouping: true,
        }
    },
})

Template.projects.events({
    'click #add-project': (event, _) => {
        event.preventDefault()
        FlowRouter.go('/projects/new')
    },
})
