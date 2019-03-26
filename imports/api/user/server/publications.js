import { Meteor } from 'meteor/meteor'
import { UsersStats } from '../usersStats'
import { ProfileImages } from '../profileImages';
import './imageProcessing'; // This sets up thumbnail creation for uploaded images

Meteor.publish(null, () => Meteor.users.find({
	_id: Meteor.userId()
}, {
	fields: {
		_id: 1,
		moderator: 1,
		profile: 1,
		suspended: 1,
		pardon: 1,
		strikes: 1,
		mod: 1,
		emails: 1,
		hidden: 1,
		imageId: 1,
	}
}))

Meteor.publish('users', () => Meteor.users.find({}, {
	fields: {
		_id: 1,
		moderator: 1,
		profile: 1,
		suspended: 1,
		pardon: 1,
		strikes: 1,
		mod: 1,
		emails: 1,
		hidden: 1,
		imageId: 1,
	}
}))

Meteor.publish('profileImages', () => {
	return ProfileImages.find({}).cursor;
});

Meteor.publish("usersStats", () => {
  return UsersStats.find({}, {fields: {userIds: 1, created: 1}})
})