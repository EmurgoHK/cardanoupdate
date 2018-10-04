import './projects.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Projects } from '/imports/api/projects/projects'

import { deleteProject } from '/imports/api/projects/methods'
import swal from 'sweetalert2'

const CHUNK_SIZE = 3

Template.projects.onCreated(function () {
    this.sort = new ReactiveVar('date-desc')
    
    this.autorun(() => {
        this.subscribe('projects')
    })
})

Template.projects.helpers({
    chunkSize () {
        return CHUNK_SIZE + 1
    },
    projects () {
        let results = Projects.find({}).fetch()
        let projects = [] 
        let projectIdx = 0

        while (projectIdx < results.length) {
            projects.push(results.slice(projectIdx, CHUNK_SIZE + projectIdx))
            projectIdx += CHUNK_SIZE
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
})
