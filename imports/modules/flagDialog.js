import swal from 'sweetalert2'
import { notify } from '/imports/modules/notifier'

// modularize the flag dialog so we don't have to repeat this code everywhere
// plus, it's also a lot easier to modify it this way

// fcn is the function that's called when an item is flagged (i.e. flagProject)
// field represents the field name for _id in method call (i.e. projectId)
// msg is a custom message that will be displayed to the user on successfull flagging
export const flagDialog = function(fcn, field, msg) {
    swal({
        title: 'Why are you reporting this?',
        html: `<div class="p-3"><span id="spam" class="flag-action btn btn-warning p-3" style="width: 40%">This is spam</span>
               <span id="scam" class="flag-action btn btn-danger p-3" style="width: 40%">This is a scam</span></div>`,
        showCancelButton: true,
        showConfirmButton: false
    }).then(data => {
        if (!data.value) {
            $(document).off('click', '.flag-action')
        }
    })

    $(document).on('click', '.flag-action', (event) => {
        fcn.call({
            [field]: this._id,
            reason: $(event.currentTarget).text().trim()
        }, (err, data) => {
            swal.close()

            if (err) {
                notify(err.reason || err.message, 'error')
            } else {
                notify(msg || 'Successfully flagged. Moderators will decide what to do next.', 'success')
            }
        })

        $(document).off('click', '.flag-action') // prevent multiple handlers
    })
}