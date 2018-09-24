import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'
import { notify } from '/imports/modules/notifier'

// Import needed templates
import '/imports/ui/pages/home/home'
import '/imports/ui/pages/login/login'
import '/imports/ui/pages/signup/signup'
import '/imports/ui/pages/not-found/not-found'
import '/imports/ui/pages/news/newsForm'
import '/imports/ui/pages/news/viewNews'
import '/imports/ui/pages/notifications/notifications'
import '/imports/ui/pages/userProfile/userProfile'

import '/imports/ui/pages/moderator/flagged/flaggedItems'

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

FlowRouter.triggers.enter([userLoginFilter], { except: ['home'] })

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

FlowRouter.route('/add', {
  name: 'addNews',
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'newsForm'
    })
  }
})

FlowRouter.route('/edit/:id', {
  name: 'editNews',
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'newsForm'
    })
  }
})

FlowRouter.route('/profile', {
  name: 'userProfile',
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewProfile'
    })
  }
})

FlowRouter.route('/news/:slug', {
  name: 'viewNews',
  action() {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewNews'
    })
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

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('main', {
      main: 'notFound'
    })
  }
}
