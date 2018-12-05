import { Mongo } from 'meteor/mongo'
import { Translations } from '../translations'

Meteor.startup(() => {
    SyncedCron.add({
        name: 'Try to send a PR with new translations',
        schedule: (parser) => parser.cron('0 1 * * *'),
        job: () => Meteor.call('sendDailyPRRequest', (err, data) => {})
    })

    // default languages
    if (!Translations.findOne({
    	_id: 'languages'
    })) {
    	Translations.insert({
    		_id: 'languages',
    		langs: {
				de: 'Deutsch',
				es: 'Español',
				ru: 'Русский язык',
				fr: 'Français',
				zh: '普通話'
			}
    	})
    } 
})
