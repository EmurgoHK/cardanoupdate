import { Meteor } from 'meteor/meteor'
import { EmbeddedImages } from '../embeddedImages';

import './imageProcessing'; // This sets up thumbnail creation for uploaded images
import './fileCleanup'; // Register cleanup task

Meteor.publish('embeddedImages', () => {
	return EmbeddedImages.find({}).cursor
})