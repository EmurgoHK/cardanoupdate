import { FlowRouter } from 'meteor/kadira:flow-router'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'

if (Meteor.isClient) {
  import { notify } from '/imports/modules/notifier'

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
  import '/imports/ui/pages/faq/faq'
  import '/imports/ui/pages/faq/faqForm'

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
}

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
  subscriptions: function(params, queryParams) {
  	this.register('research', Meteor.subscribe('research'))
    this.register('socialResources', Meteor.subscribe('socialResources'))
    this.register('projects', Meteor.subscribe('projects'))
    this.register('events', Meteor.subscribe('events'))
    this.register('news', Meteor.subscribe('news'))
    this.register('users', Meteor.subscribe('users'))
    this.register('comments', Meteor.subscribe('comments'))
    this.register('usersStats', Meteor.subscribe('usersStats'))
    this.register('warnings', Meteor.subscribe('warnings'))
    this.register('learn', Meteor.subscribe('learn'))
    this.register('stats', Meteor.subscribe('stats'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'home'
    })
  }
})

FlowRouter.route('/faqs', {
  name: 'faqs',
  subscriptions: function(params, queryParams) {
    this.register('faq', Meteor.subscribe('faq'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'faqPage'
    })
  }
})

FlowRouter.route('/faqs/new', {
  name: 'newFaq',
  triggersEnter: [userLoginFilter], 
  subscriptions: function(params, queryParams) {
    this.register('users', Meteor.subscribe('users'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'faqForm'
    })
  }
})

FlowRouter.route('/faqs/:id/edit', {
  name: 'editFaq',
  triggersEnter: [userLoginFilter],
  subscriptions: function(params, queryParams) {
    this.register('faq.item', Meteor.subscribe('faq.item', params.id))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'faqForm'
    })
  }
})

FlowRouter.route('/tags', {
  name: 'tags',
  subscriptions: function(params, queryParams) {
    this.register('socialResources', Meteor.subscribe('socialResources'))
    this.register('projects', Meteor.subscribe('projects'))
    this.register('warnings', Meteor.subscribe('warnings'))
    this.register('learn', Meteor.subscribe('learn'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'tags'
    })
  }
})

FlowRouter.route('/projects', {
  name: 'projects',
  subscriptions: function(params, queryParams) {
    this.register('projects', Meteor.subscribe('projects'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'projects'
    })
  }
})

FlowRouter.route('/projects/new', {
  name: 'newProject',
  triggersEnter: [userLoginFilter], 
  subscriptions: function(params, queryParams) {
    this.register('users', Meteor.subscribe('users'))
    this.register('tags', Meteor.subscribe('tags'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'projectForm'
    })
  }
})

FlowRouter.route('/projects/:id/edit', {
  name: 'editProject',
  triggersEnter: [userLoginFilter],
  subscriptions: function(params, queryParams) {
    this.register('projects.item', Meteor.subscribe('projects.item', params.id))
    this.register('tags', Meteor.subscribe('tags'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'projectForm'
    })
  }
})

FlowRouter.route('/projects/:slug', {
  name: 'viewProject',
  subscriptions: function(params, queryParams) {
    this.register('projects.item', Meteor.subscribe('projects.item', params.slug))
    this.register('users', Meteor.subscribe('users'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewProject'
    })
  }
})

FlowRouter.route('/scams', {
  name: 'warnings',
  subscriptions: function(params, queryParams) {
    this.register('warnings', Meteor.subscribe('warnings'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'warnings'
    })
  }
})

FlowRouter.route('/scams/new', {
  name: 'newWarning',
  triggersEnter: [userLoginFilter],
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'warningForm'
    })
  }
})

FlowRouter.route('/scams/:id/edit', {
  name: 'editWarning',
  triggersEnter: [userLoginFilter],
  subscriptions: function(params, queryParams) {
    this.register('warnings.item', Meteor.subscribe('warnings.item', params.id))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'warningForm'
    })
  }
})

FlowRouter.route('/scams/:slug', {
  name: 'viewWarning',
  subscriptions: function(params, queryParams) {
    this.register('warnings.item', Meteor.subscribe('warnings.item', params.slug))
    this.register('users', Meteor.subscribe('users'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewWarning'
    })
  }
})

FlowRouter.route('/community', {
  name: 'socialResources',
  subscriptions: function(params, queryParams) {
    this.register('socialResources', Meteor.subscribe('socialResources'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'socialResourcesTemp'
    })
  }
})

FlowRouter.route('/community/new', {
  name: 'newSocialResource',
  triggersEnter: [userLoginFilter], 
  subscriptions: function(params, queryParams) {
    this.register('tags', Meteor.subscribe('tags'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'socialResourceFormTemp'
    })
  }
})

FlowRouter.route('/community/:id/edit', {
  name: 'editSocialResource',
  subscriptions: function(params, queryParams) {
    this.register('socialResources.item', Meteor.subscribe('socialResources.item', params.id))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'socialResourceFormTemp'
    })
  }
})

FlowRouter.route('/community/:slug', {
  name: 'viewSocialResource',
  subscriptions: function(params, queryParams) {
    this.register('socialResources.item', Meteor.subscribe('socialResources.item', params.slug))
    this.register('users', Meteor.subscribe('users'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewSocialResourceTemp'
    })
  }
})

FlowRouter.route('/research', {
  name: 'research',
  subscriptions: function(params, queryParams) {
    this.register('research', Meteor.subscribe('research'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'research'
    })
  }
})

FlowRouter.route('/research/new', {
  name: 'newResearch',
  triggersEnter: [userLoginFilter], 
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'researchForm'
    })
  }
})

FlowRouter.route('/research/:slug/edit', {
  name: 'editResearch',
  triggersEnter: [userLoginFilter], 
  subscriptions: function(params, queryParams) {
    this.register('research.item', Meteor.subscribe('research.item', params.slug))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'researchForm'
    })
  }
})

FlowRouter.route('/research/:slug', {
  name: 'viewResearch',
  subscriptions: function(params, queryParams) {
    this.register('research.item', Meteor.subscribe('research.item', params.slug))
    this.register('users', Meteor.subscribe('users'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewResearch'
    })
  }
})

FlowRouter.route('/learn', {
  name: 'learn',
  subscriptions: function(params, queryParams) {
    this.register('learn', Meteor.subscribe('learn'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'learn'
    })
  }
})

FlowRouter.route('/learn/new', {
  name: 'newLearn',
  triggersEnter: [userLoginFilter], 
  subscriptions: function(params, queryParams) {
    this.register('tags', Meteor.subscribe('tags'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'learnForm'
    })
  }
})

FlowRouter.route('/learn/:slug/edit', {
  name: 'editLearn',
  triggersEnter: [userLoginFilter],
  subscriptions: function(params, queryParams) {
    this.register('learn.item', Meteor.subscribe('learn.item', params.slug))
    this.register('tags', Meteor.subscribe('tags'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'learnForm'
    })
  }
})

FlowRouter.route('/learn/:slug', {
  name: 'viewLearn',
  subscriptions: function(params, queryParams) {
    this.register('learn.item', Meteor.subscribe('learn.item', params.slug))
    this.register('users', Meteor.subscribe('users'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewLearn'
    })
  }
})

FlowRouter.route('/events', {
  name: 'events',
  subscriptions: function(params, queryParams) {
    this.register('events', Meteor.subscribe('events'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'events'
    })
  }
})

FlowRouter.route('/events/new', {
  name: 'newEvent',
  triggersEnter: [userLoginFilter], 
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'eventForm'
    })
  }
})

FlowRouter.route('/events/:id/edit', {
  name: 'editEvent',
  triggersEnter: [userLoginFilter], 
  subscriptions: function(params, queryParams) {
    this.register('events.item', Meteor.subscribe('events.item', params.id))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'eventForm'
    })
  }
})

FlowRouter.route('/events/:slug', {
  name: 'viewEvent',
  subscriptions: function(params, queryParams) {
    this.register('events.item', Meteor.subscribe('events.item', params.slug))
    this.register('users', Meteor.subscribe('users'))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'viewEvent'
    })
  }
})

FlowRouter.route('/profile/:userId', {
  name: 'userProfile',
  subscriptions: function(params, queryParams) {
    this.register('projects', Meteor.subscribe('projects'))
    this.register('users', Meteor.subscribe('users'))
    this.register('comments', Meteor.subscribe('comments'))
    this.register('research', Meteor.subscribe('research'))
  },
  action: () => {
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
  triggersEnter: [userLoginFilter], 
  subscriptions: function(params, queryParams) {
    this.register('users', Meteor.subscribe('users'))
  },
  action: () => {
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
  	subscriptions: function(params, queryParams) {
    	this.register('notifications', Meteor.subscribe('notifications'))
  	},
  	action: () => {
    	BlazeLayout.render('main', {
			header: 'header',
			sidebar: 'sidebar',
    		main: 'notifications'
    	})
  	}
})

FlowRouter.route('/login', {
  name: 'login',
  action: () => {
    BlazeLayout.render('auth', {
      main: 'login'
    })
  }
})

FlowRouter.route('/password-reset', {
  name: 'resetPassword',
  action: () => {
    BlazeLayout.render('auth', {
      main: 'passwordReset'
    })
  }
})

FlowRouter.route('/signup', {
  name: 'signup',
  action: () => {
    BlazeLayout.render('auth', {
      main: 'signup'
    })
  }
})

FlowRouter.route('/search', {
  name: 'search',
  subscriptions: function(params, queryParams) {
    this.register('projects.search', Meteor.subscribe('projects.search', queryParams.q))
    this.register('events.search', Meteor.subscribe('events.search', queryParams.q))
    this.register('learn.search', Meteor.subscribe('learn.search', queryParams.q))
    this.register('research.search', Meteor.subscribe('research.search', queryParams.q))
    this.register('warnings.search', Meteor.subscribe('warnings.search', queryParams.q))
    this.register('socialResources.search', Meteor.subscribe('socialResources.search', queryParams.q))
  },
  action: () => {
    BlazeLayout.render('main', {
      header: 'header',
      sidebar: 'sidebar',
      main: 'search'
    })
  }
})

modRoutes.route('/flagged', {
	name: 'flaggedItems',
	subscriptions: function(params, queryParams) {
		this.register('comments.flagged', Meteor.subscribe('comments.flagged'))
		this.register('news', Meteor.subscribe('news'))
		this.register('projects', Meteor.subscribe('projects'))
		this.register('warnings', Meteor.subscribe('warnings'))
		this.register('events', Meteor.subscribe('events'))
		this.register('research', Meteor.subscribe('research'))
		this.register('learn', Meteor.subscribe('learn'))
    	this.register('users', Meteor.subscribe('users'))
  	},
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
	subscriptions: function(params, queryParams) {
    	this.register('users', Meteor.subscribe('users'))
    	this.register('projects', Meteor.subscribe('projects'))
  	},
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
	subscriptions: function(params, queryParams) {
    	this.register('users', Meteor.subscribe('users'))
  	},
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
	subscriptions: function(params, queryParams) {
    	this.register('users', Meteor.subscribe('users'))
  	},
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
	subscriptions: function(params, queryParams) {
    	this.register('users', Meteor.subscribe('users'))
  	},
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

