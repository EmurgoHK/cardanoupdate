import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { Stats } from './stats'
import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'}, moderator: true }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'}, moderator: true })

describe('stats methods', () => {
    it('can calculate correct stats', () => {
        return callWithPromise('calculateStats', {}).then(data => {
            let stats = Stats.findOne({
                _id: 'last-month'
            })

            assert.ok(stats)

            assert.ok(stats.count >= 0)
        })
    })

    after(function() {
        Stats.remove({})
    })
})
