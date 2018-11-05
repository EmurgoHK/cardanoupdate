import './faq.html'
import './faq.scss'

import { FlowRouter } from 'meteor/kadira:flow-router'
import { Faq } from '/imports/api/faq/faq'

import { removeFaqItem } from '/imports/api/faq/methods'
import swal from 'sweetalert2'
import { notify } from '/imports/modules/notifier'

Template.faqPage.onRendered(function(){
  this.autorun(() => {
    this.subscribe('faq')
  })
})

Template.faqPage.helpers({
  faqCount () {
    return Faq.find({}).count()
  },
  faqs () {
    return Faq.find({}).fetch()
  },
})

Template.faqPage.events({
  'click #new-faq': (event, templateInstance) => {
    event.preventDefault()
    FlowRouter.go('/faqs/new')
  },
})

// Single FAQ Item
Template.faqItem.events({
  'click .edit-faq': (event, templateInstance) => {
    event.preventDefault()
    FlowRouter.go(`/faqs/${templateInstance.data._id}/edit`)
  },
  "click .delete-faq": function(event, templateInstance) {
    event.preventDefault()
    swal({
      text: `Are you sure you want to remove this FAQ? This action is not reversible.`,
      type: "warning",
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed.value) {
        removeFaqItem.call(
          {
            faqId: this._id
          },
          (err, data) => {
            if (err) {
              notify(err.reason || err.message, "error");
            } else {
              notify('Successfully Deleted.', 'success')
              return
            }
          }
        );
      }
    });
  },
})

Template.faqItem.helpers({
  canEdit () {
    if(this.createdBy === Meteor.userId()){
      return true
    }
    return false
  }
})