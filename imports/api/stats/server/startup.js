import { Meteor } from 'meteor/meteor'

import { calculateStats, calculateContent } from '/imports/api/stats/methods'
import { Stats } from '/imports/api/stats/stats'

Meteor.startup(() => {
  	SyncedCron.add({
    	name: 'Calculate stats',
    	schedule: (parser) => parser.cron('*/15 * * * *'), // every 15 minutes will be sufficient
    	job: () => calculateStats.call({}, (err, data) => {})
    })
    
    // calculate total projects, events, learning resources and research papers
    // every 15 minutes will be sufficient
    SyncedCron.add({
    	name: 'Calculate total content',
    	schedule: (parser) => parser.cron('*/15 * * * *'),
    	job: () => calculateContent.call({}, (err, data) => {})
  	})

  	if (!Stats.findOne({
  		_id: 'last-month'
  	})) {
      calculateStats.call({}, (err, data) => {})
    }
    
    if (!Stats.findOne({
  		_id: 'content'
  	})) {
      calculateContent.call({}, (err, data) => {})
  	}
})