import './warningForm.html'
import './warnings.scss'
 import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
 import { Warnings } from '/imports/api/warnings/warnings'
import { notify } from '/imports/modules/notifier'
 import { addWarning, editWarning } from '/imports/api/warnings/methods'
import { hideInstructionModal } from '/imports/api/user/methods'
import _ from 'lodash'
 const maxCharValue = (inputId) => {
    if (inputId === 'headline') { return 90 } 
     return 260
}
 Template.warningForm.onCreated(function() {
	if (FlowRouter.current().route.name === 'editWarning') {
		this.autorun(() => {
			this.subscribe('warnings.item', FlowRouter.getParam('id'))
             let warning = Warnings.findOne({
                _id: FlowRouter.getParam('id')
            })
		})
	} else {
    let user = Meteor.users.findOne({_id : Meteor.userId()})
    // check if user is already hidden modal for instruction
    if(user && _.includes(user.hidden, 'addWarning')) {
      Meteor.setTimeout(() => {
        $('#projectInstruction').modal('hide')
      }, 100)
    } else {
      Meteor.setTimeout(() => {
        $('#projectInstruction').modal('show')
      }, 100)
    }
  }
  
})

 Template.warningForm.helpers({
    add: () => FlowRouter.current().route.name === 'editWarning' ? false : true,
    warning: () => Warnings.findOne({ _id: FlowRouter.getParam('id') }),
})
 Template.warningForm.events({
  // Hide Instruction Modal
  'click .foreverHideModal' (event) {
    event.preventDefault()
    $('#projectInstruction').modal('hide')
    hideInstructionModal.call({modalId : 'addWarning'}, (err, res) => {
      if (!err) {
      notify('Successfully updated.', 'success')
        return
      } 
      notify('Error while updating information :: '+err.reason, 'error')
    })
  },
    'keyup .form-control' (event, _tpl) {
        event.preventDefault()
         let inputId = event.target.id
        let inputValue = event.target.value
        let inputMaxChars = maxCharValue(inputId) - parseInt(inputValue.length)
        let charsLeftText = `${inputMaxChars} characters left`
         $(`#${inputId}-chars`).text(charsLeftText)
         let specialCodes = [8, 46, 37, 39] // backspace, delete, left, right
         if (inputMaxChars <= 0) {
          	$(`#${inputId}`).keypress((e) => { return !!~specialCodes.indexOf(e.keyCode) })
          	return true
        }
        // Remove validation error, if exists
        $(`#${inputId}`).removeClass('is-invalid')
        $(`#${inputId}`).unbind('keypress')
    },
    'click .add-warning' (event, _tpl) {
        event.preventDefault()
        
        if (FlowRouter.current().route.name === 'editWarning') {
            editWarning.call({
    			projectId: FlowRouter.getParam('id'),
	    		headline: $('#headline').val(),
	    		summary: $('#description').val()
	    	}, (err, _data) => {
	    		if (!err) {
	    			notify('Successfully edited.', 'success')
	        		FlowRouter.go('/scams')
	        		return
	      		}
 		      	if (err.details && err.details.length >= 1) {
		        	err.details.forEach(e => {
		          		$(`#${e.name}`).addClass('is-invalid')
		          		$(`#${e.name}Error`).show()
		          		$(`#${e.name}Error`).text(e.message)
		        	})
		      	}
	    	})
             return
        }
         addWarning.call({
            headline: $('#headline').val(),
            summary: $('#description').val()
        }, (err, data) => {
            if (!err) {
                notify('Successfully added.', 'success')
                FlowRouter.go('/scams')
                return
            }
             if (err.details === undefined && err.reason) {
                notify(err.reason, 'error')
                return
            }
            
            if (err.details && err.details.length >= 1) {
                
                err.details.forEach(e => {
                    $(`#${e.name}`).addClass('is-invalid')
                    $(`#${e.name}Error`).show()
                    e.message = e.message.split(' ')[0] == 'Summary' ? `Description is required` : e.message;
                    $(`#${e.name}Error`).text(e.message)
                })
            }
        })
    }
}) 