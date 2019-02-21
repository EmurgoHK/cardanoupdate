import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Faq } from './faq'

import { isModerator, userStrike } from '/imports/api/user/methods'

export const newFaqItem = new ValidatedMethod({
  name: 'newFaqItem',
  validate:
    new SimpleSchema({
      question: {
        type: String,
        max: 90,
        optional: false
      },
      answer : {
        type: String,
        max: 260,
        optional: false
      }
    }).validator({
      clean: true
    }),
  run({ question, answer }) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('Error.', 'messages.login')
		}
    return Faq.insert({
      question: question,
      answer: answer,
      createdAt: new Date().getTime(),
      createdBy: Meteor.userId()
    })
  }
})

export const removeFaqItem = new ValidatedMethod({
  name: 'removeFaqItem',
  validate:
    new SimpleSchema({
      faqId: {
        type: String,
        optional: false
      }
    }).validator(),
  
  run({ faqId }) {
    let faq = Faq.findOne({
      _id: faqId
    })

    if (!faq) {
      throw new Meteor.Error('Error.', 'messages.faq.no_faq')
    }

    if (!Meteor.userId()) {
      throw new Meteor.Error('Error.', 'messages.login')
    }

    if (faq.createdBy !== Meteor.userId()) {
      throw new Meteor.Error('Error.', 'messages.faq.cant_remove')
    }

    return Faq.remove({
      _id: faqId
    })
  }
})

export const editFaqItem = new ValidatedMethod({
    name: 'editFaqItem',
    validate:
    new SimpleSchema({
      faqId: {
        type: String,
        optional: false
      },
      question: {
        type: String,
        max: 90,
        optional: false
      },
      answer : {
        type: String,
        max: 260,
        optional: false
      }
    }).validator({
      clean: true
    }),
    run({ faqId, question, answer }) {
      let faq = Faq.findOne({
        _id: faqId
      })

      if (!faq) {
        throw new Meteor.Error('Error.', 'messages.faq.no_faq')
      }

      if (!Meteor.userId()) {
        throw new Meteor.Error('Error.', 'messages.login')
      }

      if (faq.createdBy !== Meteor.userId()) {
        throw new Meteor.Error('Error.', 'messages.faq.cant_edit')
      }
      return Faq.update({
        _id: faqId
      }, {
      $set: {
        question: question,
        answer: answer,
        editedAt: new Date().getTime()
      }
    })
  }
})