import { FlowRouter } from 'meteor/kadira:flow-router'
import { notify } from '/imports/modules/notifier'
import './signup.html'

Template.signup.events({
    'click #goToLogin' (event) {
        event.preventDefault()
        FlowRouter.go('/login')
    },

    'submit' (event) {
        event.preventDefault()

        let target = event.target

        if (target.email.value !== '' && target.password.value !== '') {
            if (target.confirmPassword.value === target.password.value) {
                Accounts.createUser({
					email: target.email.value,
					password: target.password.value
				}, (err) => {
                    if (err) {
                        notify(err.message, 'error')
                        return
                    }

                    FlowRouter.go(window.last || '/')
                    return
                })

                return
            }

            notify('confirm password doesn\'t match password', 'error')
            return
        }

        notify('email/password fields are required', 'error')
    }
})