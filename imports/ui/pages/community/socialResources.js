import './socialResources.html'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Template } from 'meteor/templating'
import { socialResources } from '/imports/api/socialResources/socialResources'

const CHUNK_SIZE = 3

Template.socialResourcesTemp.onCreated(function () {
    this.sort = new ReactiveVar('date-desc')
    this.searchFilter = new ReactiveVar(undefined);

    this.autorun(() => {
        this.subscribe('socialResources')
    })
})

Template.socialResourcesTemp.helpers({
    chunkSize () {
        return CHUNK_SIZE + 1
    },
    socialResources: () => {
      let Resources = []
      let searchText = Template.instance().searchFilter.get()

      if (searchText != undefined && searchText != '') {
        Resources = socialResources.find({
          $or: [{
              description: new RegExp(searchText.replace(/ /g, '|'), 'ig')
          }, {
              Name: new RegExp(searchText.replace(/ /g, '|'), 'ig')
          }]
        })
      } else {
        Resources = socialResources.find({})
      }
      return Resources
    },
    socialResourcesCount: () => {
      let Resources = 0
      let searchText = Template.instance().searchFilter.get()

      if (searchText != undefined && searchText != '') {
        Resources = socialResources.find({
          $or: [{
              description: new RegExp(searchText.replace(/ /g, '|'), 'ig')
          }, {
              Name: new RegExp(searchText.replace(/ /g, '|'), 'ig')
          }]
        }).count()
      } else {
        Resources = socialResources.find({}).count()
      }
      return Resources
    },
})


Template.socialResourcesTemp.events({
  'click #add-Resource': (event, _) => {
      event.preventDefault()
      FlowRouter.go('/community/new')
  },
  'keyup #searchBox': function (event, templateInstance) {
    event.preventDefault();

    templateInstance.searchFilter.set($('#searchBox').val())
  },
  'blur #searchBox': function (event, templateInstance) {
    templateInstance.searchFilter.set($('#searchBox').val())
  },
})
