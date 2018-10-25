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
 	this.coolMessage = new ReactiveVar('')
	this.flagMessage = new ReactiveVar('')
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
    coolStuff: () => {
    	let warning = Warnings.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}
     	return Comments.find({
        	parentId: warning._id,
        	type: 'coolstuff'
    	}, {
    		sort: {
    			createdAt: -1
    		}
    	})
    },
    redFlags: () => {
    	let warning = Warnings.findOne({
			slug: FlowRouter.getParam('slug')
		}) || {}
     	return Comments.find({
        	parentId: warning._id,
        	type: 'redflag'
    	}, {
    		sort: {
    			createdAt: -1
    		}
    	})
    },
	coolInvalidMessage: () => Template.instance().coolMessage.get(),
	flagInvalidMessage: () => Template.instance().flagMessage.get(),
	coolCount: function () {
		return Comments.find({
		  	newsId: this._id,
		  	type: 'coolstuff'
		}).count()
	},
	flagCount: function () {
		return Comments.find({
		  	newsId: this._id,
		  	type: 'redflag'
		}).count()
	},
	tagName: function(tag) {
		if (tag.name != undefined) return tag.name
		return tag
	}
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
	'click .new-cool, click .new-flag': (event, templateInstance) => {
		event.preventDefault()
		let warning = Warnings.findOne({
			slug: FlowRouter.getParam('slug')
		})
 		let cool = $(event.currentTarget).attr('class').includes('cool')
 		newComment.call({
			parentId: warning._id,
			text: $(`#${cool ? 'cool' : 'flag'}-comment`).val(),
			newsId: warning._id,
			type: cool ? 'coolstuff' : 'redflag'
		}, (err, data) => {
      		$(`#${cool ? 'cool' : 'flag'}-comment`).val('')
 			if (!err) {
				notify('Successfully commented.', 'success')
				templateInstance[`${cool ? 'cool' : 'flag'}Message`].set('')
			} else {
				templateInstance[`${cool ? 'cool' : 'flag'}Message`].set(err.reason || err.message)
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
                proposeNewData.call({
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
                proposeNewData.call({
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