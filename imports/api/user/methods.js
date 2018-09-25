import { Meteor } from 'meteor/meteor'

import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

export const isModerator = userId => {
	let user = Meteor.users.findOne({
        _id: userId
    })

    return user && user.moderator
}

export const userStrike = new ValidatedMethod({
    name: 'userStrike',
    validate:
        new SimpleSchema({
            userId: {
                type: String,
                optional: false
            },
            type: {
                type: String,
                optional: false
            },
            token: {
                type: String,
                optional: false
            },
            times: {
                type: Number
            }
        }).validator({
            clean: true
        }),
    run({ userId, type, token, times }) {
        times = times || 1
        
        if (token !== 's3rv3r-only') {
            throw new Meteor.Error('Error.', 'Server-side only method.')
        }

        let user = Meteor.users.findOne({
            _id: userId
        })

        if (!user) {
            throw new Meteor.Error('Error.', 'User doesn\'t exist.')
        }

        Meteor.users.update({
            _id: user._id
        }, {
            $push: {
                strikes: {
                    time: new Date().getTime(),
                    type: type
                }
            }
        })

        let lastWeek = new Date().getTime() - 24*60*60*1000*7 // one week
        let strikesWeek = user.strikes ? user.strikes.reduce((i1, i2) => i1 + (i2.time > lastWeek ? 1 : 0), 0) + times : times

        let lastMonth = new Date().getTime() - 24*60*60*1000*30 // one month (30 days average)
        let strikesMonth = user.strikes ? user.strikes.reduce((i1, i2) => i1 + (i2.time > lastMonth ? 1 : 0), 0) + times : times

        if (strikesWeek > 3 || strikesMonth > 6) {
            Meteor.users.update({
                _id: userId
            }, {
                $set: {
                    suspended: true
                }
            })
        }
    }
})

export const applyForPardon = new ValidatedMethod({
    name: 'applyForPardon',
    validate:
        new SimpleSchema({
            reason: {
                type: String,
                optional: false
            }
        }).validator({
            clean: true
        }),
    run({ reason }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        Meteor.users.update({
            _id: Meteor.userId()
        }, {
            $set: {
                pardon: {
                    reason: reason,
                    status: 'new'
                }
            }
        })
    }
})

export const pardonVote = new ValidatedMethod({
    name: 'pardonVote',
    validate:
        new SimpleSchema({
            userId: {
                type: String,
                optional: false
            },
            type: {
                type: String,
                optional: false
            }
        }).validator({
            clean: true
        }),
    run({ userId, type }) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('Error.', 'You have to be logged in.')
        }

        if (!isModerator(Meteor.userId())) {
            throw new Meteor.Error('Error.', 'You have to be a moderator.')
        }

        let u = Meteor.users.findOne({
            _id: userId
        })

        if (!u) {
            throw new Meteor.Error('Error.', 'User doesn\'t exist.')
        }

        if (!(u.pardon.votes || []).filter(i => i.userId === Meteor.userId()).length) {
            Meteor.users.update({
                _id: u._id
            }, {
                $inc: {
                    'pardon.score': type === 'voteUp' ? 1 : -1, // increase or decrease the current score
                    [`pardon.${type === 'voteUp' ? 'upvotes' : 'downvotes'}`]: 1 // increase upvotes or downvotes
                },
                $push: {
                    'pardon.votes': {
                        userId: Meteor.userId(),
                        type: type,
                        time: new Date().getTime()
                    }
                }
            })
        }

        let approveChange = Meteor.users.find({
            _id: u._id
        }, {
            fields: {
                pardon: 1
            } 
        }).fetch()[0]

        if (approveChange.pardon.score >= 3) {
            Meteor.users.update({
                _id: u._id
            }, {
                $set: {
                    pardon: {
                        status: 'granted'
                    },
                    strikes: [], // clear his sins
                    suspended: false
                }
            })

            return
        }

        if (approveChange.pardon.score <= -3) {
            Meteor.users.update({
                _id: u._id
            }, {
                $set: {
                    pardon: {
                        status: 'denied'
                    }
                }
            })

            return
        }
    }
})

if (Meteor.isDevelopment) {
    Meteor.methods({
        generateTestPardon: () => {
            Meteor.users.insert({
                profile: {
                    name: 'TestPardon'
                },
                strikes: [{
                    type: 'news',
                    time: new Date().getTime()
                }],
                pardon: {
                    reason: 'Test',
                    status: 'new'
                }
            })
        },
        removeTestPardon: () => {
            Meteor.users.remove({
                'profile.name': 'TestPardon'
            })
        },
        toggleSuspended: () => {
            let user = Meteor.users.findOne({
                _id: Meteor.userId()
            })

            Meteor.users.update({
                _id: Meteor.userId()
            }, {
                $set: {
                    suspended: !user.suspended 
                }
            })
        },
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
