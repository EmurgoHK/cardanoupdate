import { Meteor } from 'meteor/meteor'
import { Config } from '/imports/api/config/config'

Meteor.startup(() => {
	SyncedCron.start()

	let config = Config.findOne({}) || {}

	Meteor.settings.public.RECAPTCHA_CLIENT = config.publicKey || ''

	reCAPTCHA.config({
        privatekey: config.privateKey || ''
	});
	
	console.log(reCAPTCHA)
})