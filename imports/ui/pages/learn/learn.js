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
  learnCount: () => {
    let learn = 0
    let searchText = Template.instance().searchFilter.get()
    if (searchText) {
      learn = Learn.find({
        $or: [{
          content: new RegExp(searchText.replace(/ /g, '|'), 'ig')
        }, {
          title: new RegExp(searchText.replace(/ /g, '|'), 'ig')
        }]
      }).count()
    } else {
      learn = Learn.find({}).count()
    }
    return learn
  },
    learn: () => {
        let learn = []
        let searchText = Template.instance().searchFilter.get()

        if (searchText) {
            learn = Learn.find({
                $or: [{
                    content: new RegExp(searchText.replace(/ /g, '|'), 'ig')
                }, {
                    title: new RegExp(searchText.replace(/ /g, '|'), 'ig')
                }]
            })
        } else {
            learn = Learn.find({})
        }

        return learn
    },
    canEdit: function() {
        return this.createdBy === Meteor.userId()
    }
})

Template.learn.events({
    'click #new-learn': (event, templateInstance) => {
        event.preventDefault()

        FlowRouter.go('/learn/new')
    },
    'keyup #searchBox': (event, templateInstance) => {
        event.preventDefault()

        templateInstance.searchFilter.set($('#searchBox').val())
    },
})
