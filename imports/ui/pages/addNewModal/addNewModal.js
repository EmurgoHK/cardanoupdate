import './addNewModal.html'
import './addNewModal.scss'

Template.AddNewModal.events({
  'click .list-group-item': (event, _) => {
    $('#newModal').modal('hide')
  },
  'click .list-group-item a' (event, template) {
    if (!Meteor.userId()) {
      event.preventDefault()
      const from = $(event.currentTarget).attr('href')
      $('#loginModal').modal('show')
      FlowRouter.setQueryParams({from})
    }
  }
})
