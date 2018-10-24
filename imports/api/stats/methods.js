import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Stats } from './stats'

import { Comments } from '/imports/api/comments/comments'
import { Projects } from '/imports/api/projects/projects'
import { Events } from '/imports/api/events/events'
import { Research } from '/imports/api/research/research'
import { socialResources } from '/imports/api/socialResources/socialResources'
import { Learn } from '/imports/api/learn/learn'

export const calculateStats = new ValidatedMethod({
    name: 'calculateStats',
    validate:
        new SimpleSchema({}).validator({
            clean: true
        }),
    run({}) {
        let comments = Comments.find({
            createdAt: {
                $gt: new Date().getTime() - 30*1000*60*60*24
            }
        }).count()

        let projects = Projects.find({
            createdAt: {
                $gt: new Date().getTime() - 30*1000*60*60*24
            }
        }).count()

        let events = Events.find({
            createdAt: {
                $gt: new Date().getTime() - 30*1000*60*60*24
            }
        }).count()

        let research = Research.find({
            createdAt: {
                $gt: new Date().getTime() - 30*1000*60*60*24
            }
        }).count()

        let social = socialResources.find({
            createdAt: {
                $gt: new Date().getTime() - 30*1000*60*60*24
            }
        }).count()

        let learn = Learn.find({
            createdAt: {
                $gt: new Date().getTime() - 30*1000*60*60*24
            }
        }).count()

        Stats.upsert({
            _id: 'last-month'
        }, {
            _id: 'last-month',
            count: comments + projects + events + research + social + learn
        })
	}
})
