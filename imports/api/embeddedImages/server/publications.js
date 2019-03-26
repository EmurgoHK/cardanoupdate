import { Meteor } from 'meteor/meteor'
import { EmbeddedImages } from '../embeddedImages';

import './imageProcessing'; // This sets up thumbnail creation for uploaded images

Meteor.publish('embeddedImages', () => {
	return EmbeddedImages.find({}).cursor
})