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
    return Tags.update({
        _id : tagId
    }, 
    { 
        $inc: { 
            mentions: 1
        }, 
    });
}

export const removeTag = (tagId) => {
    return Tags.update({
        _id : tagId
    }, 
    { 
        $inc: { 
            mentions: -1
        }, 
    });
}
