import './projects.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Projects } from '/imports/api/projects/projects'

const CHUNK_SIZE = 3

Template.projects.onCreated(function () {
    this.sort = new ReactiveVar('date-desc')
    this.searchFilter = new ReactiveVar(undefined);

    this.autorun(() => {
        this.subscribe('projects')
    })
})

Template.projects.helpers({
    chunkSize () {
        return CHUNK_SIZE + 1
    },
    projectCount () {
      let projects = 0;
      let searchText = Template.instance().searchFilter.get()

      // Check if user has searched for something
      if (searchText != undefined && searchText != '') {
          projects = Projects.find({
          $or: [{
              description: new RegExp(searchText.replace(/ /g, '|'), 'ig')
          }, {
              headline: new RegExp(searchText.replace(/ /g, '|'), 'ig')
          }, {
              tags: new RegExp(searchText.replace(/ /g, '|'), 'ig')
          }]
      }).count()
      } else {
          projects = Projects.find({}).count()
      }
      return projects
  },
    projects () {
        const tpl = Template.instance();

        // Constructing sorting options
        let sort;
        switch (tpl.sort.get()) {
            case 'date-asc':
                sort = {createdAt: 1};
                break;
            case 'date-desc':
            default:
                sort = {createdAt: -1}
        }

        const searchText = tpl.searchFilter.get()
        // Check if user has searched for something and getting data from db
        if (searchText != undefined && searchText != '') {
            return Projects.find({
                $or: [{
                    description: new RegExp(searchText.replace(/ /g, '|'), 'ig')
                }, {
                    headline: new RegExp(searchText.replace(/ /g, '|'), 'ig')
                }, {
                    tags: new RegExp(searchText.replace(/ /g, '|'), 'ig')
                }]
            }, {sort});
        }

        return Projects.find({}, {sort})
    },

    isDateAsc() {
        return Template.instance().sort.get() === 'date-asc'
    }
})

Template.projects.events({
    'click #add-project': (event, _) => {
        event.preventDefault()
        FlowRouter.go('/projects/new')
    },
    'keyup #searchBox': function (event, templateInstance) {
      event.preventDefault();

      templateInstance.searchFilter.set($('#searchBox').val())
    },
    'blur #searchBox': function (event, templateInstance) {
      templateInstance.searchFilter.set($('#searchBox').val())
    },
    'click #sort-date': (event, templateInstance) => {
        event.preventDefault()
        if (templateInstance.sort.get() === 'date-desc') {
            templateInstance.sort.set('date-asc');
        } else {
            templateInstance.sort.set('date-desc');
        }
    },
})
