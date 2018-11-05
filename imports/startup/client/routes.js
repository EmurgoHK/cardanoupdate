import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'
import { notify } from '/imports/modules/notifier'
import { Session } from 'meteor/session'

// Import needed templates
import '/imports/ui/pages/home/home'
import '/imports/ui/pages/login/login'
import '/imports/ui/pages/signup/signup'
import '/imports/ui/pages/not-found/not-found'
import '/imports/ui/pages/projects/projects'
import '/imports/ui/pages/projects/projectForm'
import '/imports/ui/pages/projects/viewProject'
import '/imports/ui/pages/warnings/warnings'
import '/imports/ui/pages/warnings/warningForm'
import '/imports/ui/pages/warnings/viewWarning'
import '/imports/ui/pages/community/socialResources'
import '/imports/ui/pages/community/socialResourceForm'
import '/imports/ui/pages/community/viewSocialResource'

import '/imports/ui/pages/tag/tag'

import '/imports/ui/pages/research/research'
import '/imports/ui/pages/research/researchForm'
import '/imports/ui/pages/research/viewResearch'

import '/imports/ui/pages/learn/learn'
import '/imports/ui/pages/learn/learnForm'
import '/imports/ui/pages/learn/viewLearn'

import '/imports/ui/pages/events/events'
import '/imports/ui/pages/events/eventForm'
import '/imports/ui/pages/events/viewEvent'
import '/imports/ui/pages/notifications/notifications'
import '/imports/ui/pages/userProfile/userProfile'
import '/imports/ui/pages/suspended/suspended'

import '/imports/ui/pages/moderator/flagged/flaggedItems'
import '/imports/ui/pages/moderator/changes/changes'
import '/imports/ui/pages/moderator/candidates/candidates'
import '/imports/ui/pages/moderator/pardon/pardon'
import '/imports/ui/pages/moderator/pardon/pardonUser'
import '/imports/ui/pages/addNewModal/addNewModal'

import '/imports/ui/pages/search/search'

const userLoginFilter = (context, redirect, _stop) => {
  let oldRoute = '/'
  let authRoutes = ['/login', '/signup']

  if (context.oldRoute !== undefined) {
    oldRoute = context.oldRoute.path
  }

  // restrict access to auth pages when user is signed in
  if (Meteor.userId() && authRoutes.includes(context.path)) {
    redirect(oldRoute)
  }

  if (!Meteor.userId() && !authRoutes.includes(context.path)) {
    notify('Login to continue!', 'error')
    redirect('/login')
  }
}

const modRoutes = FlowRouter.group({
  prefix: '/moderator',
  name: 'moderator'
})

// Redirect to login
Accounts.onLogout((user) => {
  FlowRouter.go('/login')
})

FlowRouter.triggers.enter([function(options) {

    let breadcrumb = options.route.options.breadcrumb || {};
    breadcrumb.urls = breadcrumb.urls || []

    Session.set('breadcrumbs', breadcrumb)
}])

FlowRouter.triggers.enter([() => {
  	Tracker.autorun(() => {
    	let user = Meteor.userId() && Meteor.users.findOne({
    		_id: Meteor.userId()
    	})

    	if (user && user.suspended) {
        	FlowRouter.go('/suspended')
    	}
  	})
}])

// Set up all routes in the app
FlowRouter.route('/', {
    name: 'home',
    action() {
        BlazeLayout.render('main', {
            header: 'header',
            sidebar: 'sidebar',
            main: 'home'
        })
    }
})

FlowRouter.route('/tags', {
  name: 'tags',
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'tags'
    })
  }
})

FlowRouter.route('/projects', {
  name: 'projects',
      breadcrumb: {
        text: 'Projects',
        urls: ['/projects']
    },
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'projects'
    })
  }
})

FlowRouter.route('/projects/new', {
  name: 'newProject',
      breadcrumb: {
        text: 'Projects / New',
        urls: ['/projects']
    },
  triggersEnter : [userLoginFilter], 
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'projectForm'
    })
  }
})

FlowRouter.route('/projects/:id/edit', {
  name: 'editProject',
        breadcrumb: {
        text: 'Projects / Edit',
        urls: ['/projects']
    },
  triggersEnter : [userLoginFilter], 
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'projectForm'
    })
  }
})

FlowRouter.route('/projects/:slug', {
  name: 'viewProject',
        breadcrumb: {
        text: 'Projects / View',
        urls: ['/projects']
    },
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewProject'
    })
  }
})

FlowRouter.route('/scams', {
  name: 'warnings',
        breadcrumb: {
        text: 'Scams',
        urls: ['/scams']
    },
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'warnings'
    })
  }
})

FlowRouter.route('/scams/new', {
  name: 'newWarning',
        breadcrumb: {
        text: 'Scams / New',
        urls: ['/scams']
    },
  triggersEnter : [userLoginFilter], 
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'warningForm'
    })
  }
})

FlowRouter.route('/scams/:id/edit', {
  name: 'editWarning',
        breadcrumb: {
        text: 'Scams / Edit',
        urls: ['/scams']
    },
  triggersEnter : [userLoginFilter], 
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'warningForm'
    })
  }
})

FlowRouter.route('/scams/:slug', {
  name: 'viewWarning',
        breadcrumb: {
        text: 'Scams / View',
        urls: ['/scams']
    },
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewWarning'
    })
  }
})

FlowRouter.route('/community', {
  name: 'socialResources',
        breadcrumb: {
        text: 'Community',
        urls: ['/community']
    },
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'socialResourcesTemp'
    })
  }
})

FlowRouter.route('/community/new', {
  name: 'newSocialResource',
        breadcrumb: {
        text: 'Community / New',
        urls: ['/community']
    },
  triggersEnter : [userLoginFilter], 
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'socialResourceFormTemp'
    })
  }
})

FlowRouter.route('/community/:id/edit', {
  name: 'editSocialResource',
    breadcrumb: {
        text: 'Community / Edit',
        urls: ['/community']
    },
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'socialResourceFormTemp'
    })
  }
})

FlowRouter.route('/community/:slug', {
  name: 'viewSocialResource',
      breadcrumb: {
        text: 'Community / View',
        urls: ['/community']
    },
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewSocialResourceTemp'
    })
  }
})

FlowRouter.route('/research', {
  name: 'research',
      breadcrumb: {
        text: 'Research',
        urls: ['/research']
    },
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'research'
    })
  }
})

FlowRouter.route('/research/new', {
  name: 'newResearch',
      breadcrumb: {
        text: 'Research / New',
        urls: ['/research']
    },
  triggersEnter : [userLoginFilter], 
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'researchForm'
    })
  }
})

FlowRouter.route('/research/:slug/edit', {
  name: 'editResearch',
        breadcrumb: {
        text: 'Research / Edit',
        urls: ['/research']
    },
  triggersEnter : [userLoginFilter], 
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'researchForm'
    })
  }
})

FlowRouter.route('/research/:slug', {
  name: 'viewResearch',
        breadcrumb: {
        text: 'Research / View',
        urls: ['/research']
    },
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewResearch'
    })
  }
})

FlowRouter.route('/learn', {
  name: 'learn',
        breadcrumb: {
        text: 'Learn',
        urls: ['/learn']
    },
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'learn'
    })
  }
})

FlowRouter.route('/learn/new', {
  name: 'newLearn',
          breadcrumb: {
        text: 'Learn / New',
        urls: ['/learn']
    },
  triggersEnter : [userLoginFilter], 
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'learnForm'
    })
  }
})

FlowRouter.route('/learn/:slug/edit', {
  name: 'editLearn',
         breadcrumb: {
        text: 'Learn / Edit',
        urls: ['/learn']
    },
  triggersEnter : [userLoginFilter], 
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'learnForm'
    })
  }
})

FlowRouter.route('/learn/:slug', {
  name: 'viewLearn',
         breadcrumb: {
        text: 'Learn / View',
        urls: ['/learn']
    },
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewLearn'
    })
  }
})

FlowRouter.route('/events', {
  name: 'events',
         breadcrumb: {
        text: 'Events',
        urls: ['/events']
    },
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'events'
    })
  }
})

FlowRouter.route('/events/new', {
  name: 'newEvent',
         breadcrumb: {
        text: 'Events / New',
        urls: ['/events']
    },
  triggersEnter : [userLoginFilter], 
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'eventForm'
    })
  }
})

FlowRouter.route('/events/:id/edit', {
  name: 'editEvent',
    breadcrumb: {
        text: 'Events / Edit',
        urls: ['/events']
    },
  triggersEnter : [userLoginFilter], 
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'eventForm'
    })
  }
})

FlowRouter.route('/events/:slug', {
  name: 'viewEvent',
    breadcrumb: {
        text: 'Events / View',
        urls: ['/events']
    },
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewEvent'
    })
  }
})

FlowRouter.route('/profile/:userId', {
  name: 'userProfile',
    breadcrumb: {
        text: 'Profile',
        urls: ['/events']
    },
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewProfile'
    })
  }
})

FlowRouter.route('/uploader-test', {
  name: 'uploaderTest',
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'uploader'
    })
  }
})

FlowRouter.route('/profile/:userId/edit', {
  name: 'editProfile',
  triggersEnter : [userLoginFilter], 
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'editProfile'
    })
  }
})

FlowRouter.route('/suspended', {
  	name: 'suspended',
  	action: () => {
  		let user = Meteor.userId() && Meteor.users.findOne({
      		_id: Meteor.userId()
    	})

    	if (user && user.suspended) {
   			BlazeLayout.render('suspended')
    	} else {
      		FlowRouter.go('/')
    	}
  	}
})

FlowRouter.route('/notifications', {
  	name: 'notifications',
  	action() {
    	BlazeLayout.render('main', {
			header: 'header',
			sidebar: 'sidebar',
    		main: 'notifications'
    	})
  	}
})

FlowRouter.route('/login', {
  name: 'login',
  action() {
    BlazeLayout.render('auth', {
      main: 'login'
    })
  }
})

FlowRouter.route('/password-reset', {
  name: 'resetPassword',
  action() {
    BlazeLayout.render('auth', {
      main: 'passwordReset'
    })
  }
})

FlowRouter.route('/signup', {
  name: 'signup',
  action() {
    BlazeLayout.render('auth', {
      main: 'signup'
    })
  }
})
FlowRouter.route('/search', {
  name: 'search',
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'search'
    })
  }
})

modRoutes.route('/flagged', {
	name: 'flaggedItems',
	action: () => {
		BlazeLayout.render('main', {
			header: 'header',
			sidebar: 'sidebar',
    		main: 'flaggedItems'
    	})
	}
})

modRoutes.route('/changes', {
	name: 'changes',
	action: () => {
		BlazeLayout.render('main', {
			header: 'header',
			sidebar: 'sidebar',
    		main: 'changes'
    	})
	}
})

modRoutes.route('/candidates', {
	name: 'candidates',
	action: () => {
		BlazeLayout.render('main', {
			header: 'header',
			sidebar: 'sidebar',
    		main: 'candidates'
    	})
	}
})

modRoutes.route('/pardon/:id', {
	name: 'pardonUser',
	action: () => {
		BlazeLayout.render('main', {
			header: 'header',
			sidebar: 'sidebar',
    		main: 'pardonUser'
    	})
	}
})

modRoutes.route('/pardon', {
	name: 'pardon',
	action: () => {
		BlazeLayout.render('main', {
			header: 'header',
			sidebar: 'sidebar',
    		main: 'pardon'
    	})
	}
})

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('main', {
      main: 'notFound'
    })
  }
}

