import { Meteor } from 'meteor/meteor'
import { Config } from '../config'

Meteor.publish('config', () => Config.find({
	_id: {
		$in: ['google-maps-api'] // add _id's that are safe to be published on client here
	}
}))
