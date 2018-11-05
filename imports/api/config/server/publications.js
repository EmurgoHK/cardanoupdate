import { Meteor } from 'meteor/meteor'
import { Config } from '../config'

Meteor.publish('config', () => Config.findOne({}))
