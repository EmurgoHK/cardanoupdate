import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'
import { notify } from '/imports/modules/notifier'

// Import needed templates
import '/imports/ui/pages/home/home'
import '/imports/ui/pages/login/login'
import '/imports/ui/pages/signup/signup'
import '/imports/ui/pages/not-found/not-found'
import '/imports/ui/pages/projects/projects'
import '/imports/ui/pages/projects/projectForm'
import '/imports/ui/pages/projects/viewProject'
import '/imports/ui/pages/community/socialResources'
import '/imports/ui/pages/community/socialResourceForm'
import '/imports/ui/pages/community/viewSocialResource'


import '/imports/ui/pages/research/research'
import '/imports/ui/pages/research/researchForm'
import '/imports/ui/pages/research/viewResearch'
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

// FlowRouter.triggers.enter([userLoginFilter], { except: ['home', 'projects'] })

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

FlowRouter.route('/projects', {
  name: 'projects',
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
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewProject'
    })
  }
})

FlowRouter.route('/community', {
  name: 'socialResources',
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
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewResearch'
    })
  }
})

FlowRouter.route('/events', {
  name: 'events',
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
