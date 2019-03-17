import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { Events } from './events'
import { TranslationGroups } from '../translationGroups/translationGroups';

import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({
  _id: 'test-user', 
  profile: {
    name: 'Test User'
  },
  moderator: true
}) // stub user data as well
Meteor.user = () => ({
  _id: 'test-user', 
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
      start_date: 'test',
      end_date: 'test2',
      location: 'test loc',
      rsvp: 'http://testrsvp.com',
      captcha:'_test_captcha_',
      language: 'en',
    }).then(data => {
      let event = Events.findOne({
        _id: data
      })

      assert.ok(event)

      assert.equal(event.headline, 'Test headline');
      assert.equal(event.description, 'Test description');
      assert.equal(event.start_date, 'test');
      assert.equal(event.end_date, 'test2');
      assert.equal(event.rsvp, 'http://testrsvp.com');
      assert.equal(event.location, 'test loc');

      const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: data}}});
      assert.ok(translationGroup);
      assert.equal(translationGroup.contentType, 'event');
      assert.includeDeepMembers(translationGroup.translations, [
        {language: 'en', id: data, slug: event.slug},
      ]);
    })
  })

  it('user cannot add a new event if data is missing', () => {
    return callWithPromise('newEvent', {
      headline: 'Test headline',
      description: '',
      captcha:'_test_captcha_'
    }).then(data => {}).catch(error => {
      assert.ok(error)
    })
  })

  it('user can add a translation of an event by id', () => {
    const original = Events.findOne({});
    return callWithPromise('newEvent', {
      headline: 'Test headline',
      description: 'Test description',
      start_date: 'test',
      end_date: 'test2',
      location: 'test loc',
      rsvp: 'http://testrsvp.com',
      captcha:'_test_captcha_', 
      language: 'sr',
      original: original._id,
    }).then(data => {
      let event = Events.findOne({
        _id: data
      })

      assert.ok(event)

      assert.equal(event.headline, 'Test headline');
      assert.equal(event.description, 'Test description');
      assert.equal(event.start_date, 'test');
      assert.equal(event.end_date, 'test2');
      assert.equal(event.rsvp, 'http://testrsvp.com');
      assert.equal(event.location, 'test loc');

      const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: data}}});
      assert.ok(translationGroup);
      assert.equal(translationGroup.contentType, 'event');
      assert.includeDeepMembers(translationGroup.translations, [
        {language: 'sr', id: data, slug: event.slug},
        {language: original.language, id: original._id, slug: original.slug}
      ]);
    })
  });

  it('user can add a translation of an event by id if the event was created before translations', () => {
    const originalId = Events.insert({
      headline: 'Test headline old',
      description: 'Test description',
      start_date: 'test',
      end_date: 'test2',
      location: 'test loc',
      rsvp: 'http://testrsvp.com',
      slug: 'test-headline-old',
    });
    const original = Events.findOne({_id: originalId});

    return callWithPromise('newEvent', {
      headline: 'Test headline',
      description: 'Test description',
      start_date: 'test',
      end_date: 'test2',
      location: 'test loc',
      rsvp: 'http://testrsvp.com',
      captcha:'_test_captcha_', 
      language: 'sr',
      original: original._id,
    }).then(data => {
      let event = Events.findOne({
        _id: data
      })

      assert.ok(event)

      assert.equal(event.headline, 'Test headline');
      assert.equal(event.description, 'Test description');
      assert.equal(event.start_date, 'test');
      assert.equal(event.end_date, 'test2');
      assert.equal(event.rsvp, 'http://testrsvp.com');
      assert.equal(event.location, 'test loc');

      const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: data}}});
      assert.ok(translationGroup);
      assert.equal(translationGroup.contentType, 'event');
      assert.includeDeepMembers(translationGroup.translations, [
        {language: 'sr', id: data, slug: event.slug},
        {language: 'en', id: original._id, slug: original.slug}
      ]);
    })
  });
  
  it('user can not add an event by wrong original id/slug', () => {
    return callWithPromise('newEvent', {
      headline: 'Test headline',
      description: 'Test description',
      start_date: 'test',
      end_date: 'test2',
      location: 'test loc',
      rsvp: 'http://testrsvp.com',
      captcha:'_test_captcha_', 
      language: 'sr',
      original: 'nope',
    }).then(data => {
      assert.fail('', '', 'Did not throw');
    }, err => {
      assert(err, 'messages.originalNotFound');
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
      location: 'test web',
      rsvp:'http://test.com',
      captcha:'_test_captcha_'
    }).then(data => {
      let event2 = Events.findOne({
        _id: event._id
      })

      assert.ok(event2)

      assert.ok(event2.headline === 'Test headline 2')
      assert.ok(event2.description === 'Test description 2')
      assert.ok(event2.start_date === 'test')
      assert.ok(event2.end_date === 'test')
      assert.ok(event2.location === 'test web')
      assert.ok(event2.rsvp === 'http://test.com')

      const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: event._id}}});
      assert.ok(translationGroup);
      assert.equal(translationGroup.contentType, 'event');
      assert.deepInclude(translationGroup.translations, {language: event.language, id: event._id, slug: event2.slug});
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
      rsvp : 'http://test.com',
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
      rsvp : 'http://test.com',
      captcha:'_test_captcha_'
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

      assert.notOk(event2);
      assert.notOk(TranslationGroups.findOne({translations: {$elemMatch: {id: event._id}}}));
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
      rsvp : 'http://test.com',
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