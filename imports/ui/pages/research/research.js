import './research.html'
import './research.scss'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Research } from '/imports/api/research/research'

import { removeResearch } from '/imports/api/research/methods'
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
    },

    searchArgs() {
        const instance = Template.instance();
        return {
            placeholder:"Search research",
            type: 'research',
            onChange: (newTerm) => instance.searchFilter.set(newTerm),
        }
    },
})

Template.research.events({
    'click #new-research': (event, _) => {
        event.preventDefault()
        FlowRouter.go('/research/new')
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
