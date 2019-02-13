import { Mongo } from 'meteor/mongo'

export const Research = new Mongo.Collection('research')

Research.friendlySlugs({
  	slugFrom: ['headline', 'language'],
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
