import './body.html'
import './body.scss'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
 import { Session } from 'meteor/session'
import swal from 'sweetalert2'

Template.main.events({
	'click a, click .btn': (event, templateInstance) => {
		if (!Meteor.userId()) {
			if (!~['home', 'projects', 'search'].indexOf(FlowRouter.current().route.name) && !$(event.currentTarget).hasClass('nav-link')) {
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

Template.main.helpers({
    breadcrumbs: () => {
        let bc = Session.get('breadcrumbs') || {}
        
        if (bc && bc.text) {
        	bc.text = TAPi18n.__(`breadcrumbs.${bc.text}`, {
      			postProcess: 'sprintf',
      			sprintf: [bc.name || '']
    		})

          let crumbs = bc.text.split('/')
          bc.urls = bc.urls || []
          bc.urls.push(FlowRouter.current().path)

          return crumbs.map((i, ind) => {
              if (bc.param !== undefined && i.trim() === bc.param)
                  i = FlowRouter.getParam(bc.param)

              if (i !== undefined) {
                  return {
                      text: i,
                      url: bc.urls[ind],
                      notLast: ind !== crumbs.length - 1
                  }
              }
          })
        }
    }
})
