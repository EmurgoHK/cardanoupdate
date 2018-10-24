import { Meteor } from 'meteor/meteor'

import { Stats } from '../stats'

Meteor.publish('stats', () => Stats.find({}))