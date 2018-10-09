import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'
import { Events } from './events'
import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({
  profile: {
    name: 'Test User'
  },
  moderator: true
}) // stub user data as well
Meteor.user = () => ({
  profile: {
    name: 'Test User'
  },
  moderator: true
})

describe('event methods', () => {
  it('user can add a new event', () => {
    return callWithPromise('newEvent', {
      headline: 'Test headline',
      description: 'Test description',
      github_url: 'test',
      website: 'test web'
    }).then(data => {
      let event = Events.findOne({
        _id: data
      })

      assert.ok(event)

      assert.ok(event.headline === 'Test headline')
      assert.ok(event.description === 'Test description')
      assert.ok(event.start_date === 'test')
      assert.ok(event.end_date === 'test')
      assert.ok(event.location === 'city, country')
    })
  })

  it('user cannot add a new event if data is missing', () => {
    return callWithPromise('newEvent', {
      headline: 'Test headline',
      description: ''
    }).then(data => {}).catch(error => {
      assert.ok(error)
    })
  })

  it('user can edit a event', () => {
    let event = Events.findOne({})

    assert.ok(event)

    return callWithPromise('editEvent', {
      eventId: event._id,
      headline: 'Test headline 2',
      description: 'Test description 2',
      start_date: 'test',
      end_date : 'test',
      location: 'test web'
    }).then(data => {
      let event2 = Events.findOne({
        _id: event._id
      })

      assert.ok(event2)

      assert.ok(event2.headline === 'Test headline 2')
      assert.ok(event2.description === 'Test description 2')
      assert.ok(event2.start_date === 'test')
      assert.ok(event2.end_date === 'test web')
      assert.ok(event2.location === 'test web')
    })
  })

  it('user cannot edit a event the he/she didn\'t create', () => {
    let event = Events.insert({
      headline: 'a',
      description: 'b',
      createdBy: 'not-me',
      start_date : 'test',
      end_date : 'test',
      location : 'test',
      createdAt: new Date().getTime()
    })

    assert.ok(event)

    return callWithPromise('editEvent', {
      eventId: event,
      headline: 'Test headline 2',
      description: 'Test description 2',
      start_date : 'test',
      end_date : 'test',
      location : 'test',
    }).then(data => {}).catch(error => {
      assert.ok(error)
    })
  })

  it('user can remove a event', () => {
    let event = Events.findOne({
      headline: 'Test headline 2'
    })

    assert.ok(event)

    return callWithPromise('deleteEvent', {
      eventId: event._id
    }).then(data => {
      let event2 = Events.findOne({
        _id: event._id
      })

      assert.notOk(event2)
    })
  })

  it('user cannot remove a event that he/she didn\'t create', () => {
    let event = Events.findOne({})

    assert.ok(event)

    return callWithPromise('deleteEvent', {
      eventId: event._id
    }).then(data => {}).catch(error => {
      assert.ok(error)
    })
  })

  it('user can flag a event', () => {
    let event = Events.insert({
      headline: 'a',
      description: 'b',
      start_date : 'test',
      end_date : 'test',
      location : 'test',
      createdBy: 'not-me',
      createdAt: new Date().getTime()
    })

    assert.ok(event)

    return callWithPromise('flagEvent', {
      eventId: event,
      reason: 'Test reason'
    }, (err, data) => {
      let p2 = Events.findOne({
        _id: event
      })

      assert.ok(p2)

      assert.ok(p2.flags.length > 0)
      assert.ok(p2.flags[0].reason === 'Test reason')
    })
  })

  it('moderator can remove a flagged event', () => {
    let event = Events.findOne({
      flags: {
        $exists: true
      }
    })

    assert.ok(event)

    return callWithPromise('resolveEventFlags', {
      eventId: event._id,
      decision: 'remove'
    }, (err, data) => {
      let p2 = Events.findOne({
        _id: event._id
      })

      assert.notOk(p2)
    })
  })

  after(function () {
    Events.remove({})
  })
})