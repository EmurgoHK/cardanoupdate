import './body.html'
import './body.scss'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Session } from 'meteor/session'

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
