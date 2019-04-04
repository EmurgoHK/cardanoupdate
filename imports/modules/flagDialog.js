import Swal from 'sweetalert2'
import './flagDialog.scss'
// modularize the flag dialog so we don't have to repeat this code everywhere
// plus, it's also a lot easier to modify it this way

// fcn is the function that's called when an item is flagged (i.e. flagProject)
// field represents the field name for _id in method call (i.e. projectId)
// msg is a custom message that will be displayed to the user on successfull flagging
export const flagDialog = function(fnc, field, msg) {
  if (Meteor.userId()) {
    Swal({
      title: 'Why are you reporting this?',
      html: `
        <form id="flagForm" class="flag-form">
          <div class="input-group">
            <input type="radio" id="flag-option-1" name="resaon" value="spam">
            <label for="flag-option-1">This is spam</label>
            <div class="check"></div>
          </div>
          <div class="input-group">
            <input type="radio" id="flag-option-2" name="resaon" value="scam">
            <label for="flag-option-2">This is a scam</label>
            <div class="check"></div>
          </div>
          <div class="input-group">
            <input type="radio" id="flag-option-3" name="resaon" value="deprecated">
            <label for="flag-option-3">This no longer exists</label>
            <div class="check"></div>
          </div>
          <div class="input-group">
            <input type="radio" id="flag-option-4" name="resaon" value="other">
            <label for="flag-option-4">Other</label>
            <div class="check"></div>
          </div>
          <div class="input-group">
            <textarea id="flag-remark" name="remark" placeholder="Additional information (If any)"></textarea>
          </div>
        </form>`,
      showCancelButton: true,
      showConfirmButton: true,
      showLoaderOnConfirm: false,
      confirmButtonText: 'Submit',
      preConfirm: (data) => {
        const reason = $('input[type="radio"]:checked').val()
        const remark = $('#flag-remark').val()
        return new Promise((resolve, reject) => {
          if(!reason){
            throw new Error('select reason')
          }
          resolve({reason, remark})
        }).catch(error =>{
          Swal.showValidationError(error)
        })
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then(data => {
      if (data.value) {
        const { reason, remark } = data.value
        fnc.call({
          [field]: this._id,
          reason: reason,
          remark: remark
        }, (err, data) => {
          if (err) {
            Swal({
              type: 'error',
              title: err.reason || err.message,
              showConfirmButton: true
            })
          } else {
            Swal({
              type: 'success',
              title: 'Successfully flagged. Moderators will decide what to do next',
              showConfirmButton: true
            })
          }
        })
      }
    })
  } else {
    $('#loginModal').modal('show')
  }
}
