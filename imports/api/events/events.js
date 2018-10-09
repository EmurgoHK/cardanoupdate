import { Mongo } from 'meteor/mongo'

export const Events = new Mongo.Collection('events')

Events.friendlySlugs({
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