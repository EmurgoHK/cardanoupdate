import './projects.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Projects } from '/imports/api/projects/projects'

import { deleteProject, proposeNewData, flagProject } from '/imports/api/projects/methods'
import swal from 'sweetalert2'

import { notify } from '/imports/modules/notifier'

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
    'click .github': function(event, temlateInstance) {
        if ($(event.currentTarget).attr('href')) {
            return
        }

        swal({
            text: `GitHub repo is not available. If you know this information, please contribute below:`,
            type: 'warning',
            showCancelButton: true,
            input: 'text'
        }).then(val => {
            if (val.value) {
                proposeNewData.call({
                    projectId: this._id,
                    datapoint: 'github_url',
                    newData: val.value,
                    type: 'link'
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    } else {
                        notify('Successfully contributed.', 'success')
                    }
                })
            }
        })
    },
    'click .website': function(event, temlateInstance) {
        if ($(event.currentTarget).attr('href')) {
            return
        }

        swal({
            text: `Website is not available. If you know this information, please contribute below:`,
            type: 'warning',
            showCancelButton: true,
            input: 'text'
        }).then(val => {
            if (val.value) {
                proposeNewData.call({
                    projectId: this._id,
                    datapoint: 'website',
                    newData: val.value,
                    type: 'link'
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    } else {
                        notify('Successfully contributed.', 'success')
                    }
                })
            }
        })
    },
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
    },

    'click .flag-project' : function (event, templateInstance){
      event.preventDefault()
      swal({
		  	title: 'Why are you flagging this?',
		  	input: 'text',
		  	showCancelButton: true,
		  	inputValidator: (value) => {
		    	return !value && 'You need to write a valid reason!'
		  	}
      }).then(data => {
        if (data.value) {
          flagProject.call({
            projectId: this._id,
            reason: data.value
          }, (err, data) => {
            if (err) {
              notify(err.reason || err.message, 'error')
            } else {
              notify('Successfully flagged. Moderators will decide what to do next.', 'success')
            }
          })
        }
      })
    }
})
