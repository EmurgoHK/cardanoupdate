import { Meteor } from 'meteor/meteor'

import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

export const isModerator = userId => {
	let user = Meteor.users.findOne({
        _id: userId
    })

    return user && user.moderator
}

if (Meteor.isDevelopment) {
    Meteor.methods({
        generateTestUser: () => {
            let user = Meteor.users.findOne({
                username: 'testing'
            })

            if (!user) {
                let uId = Accounts.createUser({
                    username: 'testing',
                    password: 'testing',
                    email: 'testing@testing.test',
                    profile: {
                        name: 'Tester'
                    }
                })

                Meteor.users.update({
                    _id: uId
                }, {
                    $set: {
                        moderator: true
                    }
                })
            }
        }
    })
}
