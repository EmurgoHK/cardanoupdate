import './projects.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Projects } from '/imports/api/projects/projects'

import { deleteProject } from '/imports/api/projects/methods'
import swal from 'sweetalert2'

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
    projects () {
        let projects = [];
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
        })
        } else {
            projects = Projects.find({})
        }

        return projects
    },
    canEdit () {
        return this.createdBy === Meteor.userId()
    }
})

Template.projects.events({
    'click #add-project': (event, _) => {
        event.preventDefault()
        FlowRouter.go('/projects/new')
    },
    'click #js-remove': function (event, _) {
        event.preventDefault()
        
        swal({
            text: `Are you sure you want to remove this Project? This action is not reversible.`,
            type: 'warning',
            showCancelButton: true 
        }).then(confirmed => {
            if (confirmed.value) {
                deleteProject.call({
                    projectId: this._id
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    }
                })
            }
        })
      },
    'click .projectWarning' (event, _tpl) {
        event.preventDefault()
        swal({
            title: 'Missing source repository',
            text: "This project does't contain any link to the source repository",
            type: 'warning',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Okay'
        })
    },
    'keyup #searchBox': function (event, templateInstance) {
      event.preventDefault();

      templateInstance.searchFilter.set($('#searchBox').val())
    }

})
