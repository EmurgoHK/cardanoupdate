import './research.html'
import './research.scss'

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

        // Checking if the user searched for something and fetching data
        const searchText = tpl.searchFilter.get();
        if (searchText) {
            return Research.find({
                $or: [{
                    abstract: new RegExp(searchText.replace(/ /g, '|'), 'ig')
                }, {
                    headline: new RegExp(searchText.replace(/ /g, '|'), 'ig')
                }]
            }, {sort});
        }
        return Research.find({}, {sort});
    },
    canEdit: function() {
        return this.createdBy === Meteor.userId()
    },

    isDateAsc() {
        return Template.instance().sort.get() === 'date-asc'
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
