import './viewWarning.html'
import '../comments/commentBody'
 import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
 import { Warnings } from '/imports/api/warnings/warnings'
import { Comments } from '/imports/api/comments/comments'
 import { newComment } from '/imports/api/comments/methods' 
import { flagWarning } from '/imports/api/warnings/methods'
 import { notify } from '/imports/modules/notifier'
 import swal from 'sweetalert2'
 Template.viewWarning.onCreated(function() {
	this.autorun(() => {
		this.subscribe('warnings.item', FlowRouter.getParam('slug'))
		this.subscribe('users')
 		let warning = Warnings.findOne({
			slug: FlowRouter.getParam('slug')
		})
 		if (warning) {
			this.subscribe('comments.item', warning._id)
		}
	})
 	this.commentMessage = new ReactiveVar('')
})
 Template.viewWarning.helpers({
  isOwner : function() {
    if(this.createdBy === Meteor.userId()){
      return true
    }
    return false
  },
  	warning: () => Warnings.findOne({
		slug: FlowRouter.getParam('slug')
	}),
	author: function() {
        return ((Meteor.users.findOne({
            _id: this.createdBy
        }) || {}).profile || {}).name || 'No name'
    },
    comment: () => {
    	let warning = Warnings.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}
     	return Comments.find({
			parentId: warning._id,
			$or: [
				{ type: 'coolstuff' },
				{ type: 'redflag' },
				{ type: 'warning' },
			]
    	}, {
    		sort: {
    			createdAt: -1
    		}
    	})
    },
	commentInvalidMessage: () => Template.instance().commentMessage.get(),
	commentCount: function () {
		return Comments.find({
		  	newsId: this._id,
		}).count()
	},
	
	tagName: (tag) => tag.name,
	tagUrl: (tag) => `/tags?search=${encodeURIComponent(tag.name)}`,
})
 Template.viewWarning.events({
	'click .flag-warning': (event, templateInstance) => {
		let warning = Warnings.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}
 		swal({
		  	title: 'Why are you flagging this?',
		  	input: 'text',
		  	showCancelButton: true,
		  	inputValidator: (value) => {
		    	return !value && 'You need to write a valid reason!'
		  	}
		}).then(data => {
			if (data.value) {
				flagWarning.call({
					projectId: warning._id,
					reason: data.value
				}, (err, data) => {
					if (err) {
						notify(err.reason || err.message, 'error')
					} else {
						notify('Successfully flagged. Moderators will decide what to do next.', 'success')
					}
				})
			}
		})
	},
	'click .new-comment': (event, templateInstance) => {
		event.preventDefault()
		let warning = Warnings.findOne({
			slug: FlowRouter.getParam('slug')
		})
 		newComment.call({
			parentId: warning._id,
			text: templateInstance.$(`#comment`).val(),
			newsId: warning._id,
			type: 'warning',
		}, (err, data) => {
      		templateInstance.$(`#comment`).val('')
 			if (!err) {
				notify('Successfully commented.', 'success')
				templateInstance.commentMessage.set('')
			} else {
				templateInstance.commentMessage.set(err.reason || err.message)
			}
		})
	},
	'click .github': function(event, temlateInstance) {
        if ($(event.currentTarget).attr('href')) {
            return
        }
         swal({
            text: `GitHub repo is not available. If you know this information, please contribute below:`,
            type: 'warning',
            showCancelButton: true,
            input: 'text'
        }).then(val => {
            if (val.value) {
                proposeNewDataWarning.call({
                    projectId: this._id,
                    datapoint: 'github_url',
                    newData: val.value,
                    type: 'link'
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    } else {
                        notify('Successfully contributed.', 'success')
                    }
                })
            }
        })
    },
    'click .website': function(event, temlateInstance) {
        if ($(event.currentTarget).attr('href')) {
            return
        }
         swal({
            text: `Website is not available. If you know this information, please contribute below:`,
            type: 'warning',
            showCancelButton: true,
            input: 'text'
        }).then(val => {
            if (val.value) {
                proposeNewDataWarning.call({
                    projectId: this._id,
                    datapoint: 'website',
                    newData: val.value,
                    type: 'link'
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    } else {
                        notify('Successfully contributed.', 'success')
                    }
                })
            }
        })
    },
    'click .projectWarning' (event, _tpl) {
        event.preventDefault()
        console.log('here')
        swal({
            title: 'Missing source repository',
            text: "This project does't contain any link to the source repository",
            type: 'warning',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Okay'
        })
    }
})