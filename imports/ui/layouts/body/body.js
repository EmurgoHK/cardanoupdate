import './body.html'
import './body.scss'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import swal from 'sweetalert2'

Template.main.events({
	'click a, click .btn': (event, templateInstance) => {
		if (!Meteor.userId()) {
			if (!~['home', 'projects'].indexOf(FlowRouter.current().route.name) && !$(event.currentTarget).hasClass('nav-link')) {
				event.stopImmediatePropagation()
				event.stopPropagation()
				event.preventDefault()

				FlowRouter.go('/login')

				//if (swal.isVisible()) { // a hack to prevent swal dialogs from showing up
					swal.close()
				//}

				return false
			}
		}
	}
})