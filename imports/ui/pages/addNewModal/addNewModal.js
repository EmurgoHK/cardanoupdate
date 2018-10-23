import './addNewModal.html'
import './addNewModal.scss'

Template.AddNewModal.events({
  'click .list-group-item': (event, _) => {
    $('#newModal').modal('hide')
  }

  })
