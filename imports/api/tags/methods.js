import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { Tags } from './tags'

export const addTag = (name) => {
    return Tags.insert({
        name: name,
        mentions: 1,
        createdAt: new Date().getTime()
    })
}

export const getTag = (name) => {
    return Tags.findOne({
        name: new RegExp(name, 'i')
    })
}

export const mentionTag = (tagId) => {
    let tag = Tags.findOne({ _id : tagId });
    tag.mentions = parseInt(tag.mentions) + 1

    return Tags.update({
        _id : tagId
    }, 
    { 
        $set: { 
            mentions : tag.mentions
        } 
    })
}