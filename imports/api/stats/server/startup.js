import { Meteor } from 'meteor/meteor'

import { calculateStats } from '/imports/api/stats/methods'
import { Stats } from '/imports/api/stats/stats'

Meteor.startup(() => {
  	SyncedCron.add({
    	name: 'Calculate stats',
    	schedule: (parser) => parser.cron('*/15 * * * *'), // every 15 minutes will be sufficient
    	job: () => calculateStats.call({}, (err, data) => {})
  	})

  	if (!Stats.findOne({
  		_id: 'last-month'
  	})) {
  		calculateStats.call({}, (err, data) => {})
  	}
})