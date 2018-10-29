import './research.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Research } from '/imports/api/research/research'

import { removeResearch, flagResearch } from '/imports/api/research/methods'
import swal from 'sweetalert2'

import { notify } from '/imports/modules/notifier'
import { flagDialog } from '/imports/modules/flagDialog'

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
    researchCount: () => {
      let research = 0
      let searchText = Template.instance().searchFilter.get()
      if (searchText) {
        research = Research.find({
          $or: [{
              abstract: new RegExp(searchText.replace(/ /g, '|'), 'ig')
          }, {
              headline: new RegExp(searchText.replace(/ /g, '|'), 'ig')
          }]
        }).count()
      } else {
        research = Research.find({}).count()
      }
      return research
    },
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
        
        flagDialog.call(this, flagResearch, 'researchId')
    }
})
