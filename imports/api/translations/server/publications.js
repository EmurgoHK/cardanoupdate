import { Meteor } from 'meteor/meteor'
import { Translations } from '../translations'

Meteor.publish('translations', () => {
    return Translations.find({})
})

Meteor.publish('langs', () => Translations.find({
	_id: 'languages'
}))