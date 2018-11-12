import './socialResources.html'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Template } from 'meteor/templating'

const CHUNK_SIZE = 3

Template.socialResourcesTemp.onCreated(function () {
    this.sort = new ReactiveVar('date-desc')
    this.searchFilter = new ReactiveVar(undefined);
})

Template.socialResourcesTemp.helpers({
    chunkSize () {
        return CHUNK_SIZE + 1
    },

    searchArgs() {
        const instance = Template.instance();
        return {
            placeholder:"Search communities",
            type: 'socialResources',
            onChange: (newTerm) => instance.searchFilter.set(newTerm),
        }
    },
    resultArgs() {
        return {
            types: ['socialResources'],
            searchTerm: Template.instance().searchFilter.get(),
        }
    },
})


Template.socialResourcesTemp.events({
  'click #add-Resource': (event, _) => {
      event.preventDefault()
      FlowRouter.go('/community/new')
  },
})
