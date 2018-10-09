import { Meteor } from 'meteor/meteor'

import { possibleModerators } from '../methods'

Meteor.startup(() => {
    SyncedCron.add({
        name: 'Fetch possible moderators',
        schedule: (parser) => parser.cron('0 */6 * * *'), // every 6 hours will be sufficient
        job: () => possibleModerators.call({}, (err, data) => {})
    })
})
