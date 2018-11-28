import { Mongo } from 'meteor/mongo'

export const socialResources = new Mongo.Collection('socialResources')

socialResources.friendlySlugs({
  	slugFrom: 'Name',
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
