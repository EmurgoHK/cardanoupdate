import './socialResourceList.html'

import { Template } from 'meteor/templating'
import { deleteSocialResource} from '/imports/api/socialResources/methods'

import swal from 'sweetalert2'

Template.socialResourceList.helpers({
    canEdit () {
        return this.createdBy === Meteor.userId()
    }
})


Template.socialResourceList.events({
  'click #js-remove': function (event, _) {
      event.preventDefault()

      swal({
          text: `Are you sure you want to remove this Project? This action is not reversible.`,
          type: 'warning',
          showCancelButton: true
      }).then(confirmed => {
          if (confirmed.value) {
              deleteSocialResource.call({
                  projectId: this._id
              }, (err, data) => {
                  if (err) {
                      notify(err.reason || err.message, 'error')
                  }
              })
          }
      })
    }
})
