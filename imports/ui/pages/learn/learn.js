import './learn.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Learn } from '/imports/api/learn/learn'

const CHUNK_SIZE = 3

Template.learn.onCreated(function () {
    this.sort = new ReactiveVar('date-desc')
    this.searchFilter = new ReactiveVar('')
    
    this.autorun(() => {
        this.subscribe('learn')
    })
})

Template.learn.helpers({
  chunkSize: () => CHUNK_SIZE + 1,
    canEdit: function() {
        return this.createdBy === Meteor.userId()
    },

    searchArgs() {
        const instance = Template.instance();
        return {
            placeholder: TAPi18n.__('learn.main.search'),
            type: 'learn',
            onChange: (newTerm) => instance.searchFilter.set(newTerm),
        }
    },
    resultArgs() {
        return {
            types: ['learn'],
            searchTerm: Template.instance().searchFilter.get(),
        }
    },
})

Template.learn.events({
    'click #new-learn': (event, templateInstance) => {
        event.preventDefault()

        FlowRouter.go('/learn/new')
    },
})
