import { Mongo } from 'meteor/mongo'

export const Warnings = new Mongo.Collection('warnings')

Warnings.friendlySlugs({
  	slugFrom: 'headline',
  	slugField: 'slug',
  	distinct: true,
  	updateSlug: true,
  	debug: false,
  	transliteration: [{
    	from: 'ü',
    	to: 'u'
  	}, {
    	from: 'õö',
    	to: 'o'
  	}]
})