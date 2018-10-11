import './research.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Research } from '/imports/api/research/research'

import { removeResearch, flagResearch } from '/imports/api/research/methods'
import swal from 'sweetalert2'

import { notify } from '/imports/modules/notifier'

const CHUNK_SIZE = 3

Template.research.onCreated(function () {
    this.sort = new ReactiveVar('date-desc')
    this.searchFilter = new ReactiveVar('')
    
    this.autorun(() => {
        this.subscribe('research')
    })
})

Template.research.helpers({
    chunkSize: () => CHUNK_SIZE + 1,
    research: () => {
        let research = []
        let searchText = Template.instance().searchFilter.get()

        if (searchText) {
            research = Research.find({
                $or: [{
                    abstract: new RegExp(searchText.replace(/ /g, '|'), 'ig')
                }, {
                    headline: new RegExp(searchText.replace(/ /g, '|'), 'ig')
                }]
            })
        } else {
            research = Research.find({})
        }

        return research
    },
    canEdit: function() {
        return this.createdBy === Meteor.userId()
    }
})

Template.research.events({
    'click #new-research': (event, _) => {
        event.preventDefault()
        FlowRouter.go('/research/new')
    },
    'click #js-remove': function (event, _) {
        event.preventDefault()
        
        swal({
            text: `Are you sure you want to remove this research papaer? This action is not reversible.`,
            type: 'warning',
            showCancelButton: true 
        }).then(confirmed => {
            if (confirmed.value) {
                removeResearch.call({
                    researchId: this._id
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    }
                })
            }
        })
    },
    'keyup #searchBox': function(event, templateInstance) {
        event.preventDefault()

        templateInstance.searchFilter.set($('#searchBox').val())
    },
    'click .flag-research' : function(event, templateInstance) {
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
                flagResearch.call({
                    researchId: this._id,
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
