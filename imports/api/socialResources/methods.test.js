import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { socialResources } from './socialResources'
import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ _id: 'test-user', profile: { name: 'Test User'}, moderator: true }) // stub user data as well
Meteor.user = () => ({ _id: 'test-user', profile: { name: 'Test User'}, moderator: true })

describe('social resources methods', () => {

    it('user can create a social resource', () => {
        return callWithPromise('addSocialResource', {
            Name: 'Test Resource',
            description: 'Test Resource',
            Resource_url: 'test'
        }).then(data => {
            let resource = socialResources.findOne({
                _id: data
            })

            assert.ok(resource)
            assert.ok(resource.Name === 'Test Resource')
            assert.ok(resource.description === 'Test Resource')
            assert.ok(resource.Resource_url === 'test')
        })
    })

    it('user cannot add a social resource if data is missing', () => {
        return callWithPromise('addSocialResource', {
            Name: 'Test Resource',
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can edit a social resource he/she created', () => {
        let resource = socialResources.findOne({})

        assert.ok(resource)

        return callWithPromise('editSocialResource', {
            projectId: resource._id,
            Name: 'Test Resource 2',
            description: 'Test Resource 2',
            Resource_url: 'test 2'
        }).then(data =>{
            let resource2 = socialResources.findOne({
                _id: resource._id
            })

            assert.ok(resource2)
            assert.ok(resource2.Name === 'Test Resource 2')
            assert.ok(resource2.description === 'Test Resource 2')
            assert.ok(resource2.Resource_url === 'test 2')
        })
    })

    it('user cannot edit a social resource he/she did\'t create',() => {
        let resource = socialResources.insert({
            Name: 'Temp Resource',
            description: 'Temp Resource',
            createdBy: 'temp'
        })

        assert.ok(resource)

        return callWithPromise('editSocialResource', {
            projectId: resource,
            Name: 'TEST community',
            description: 'TEST community'
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })

    }) 

    it('user cannot delete a social resource he/she didn\'t create', () => {
        let resource = socialResources.insert({
            Name: 'Temp Resource',
            description: 'Temp Resource',
            createdBy: 'temp'
        })

        assert.ok(resource)

        return callWithPromise('deleteSocialResource', {
            projectId: resource
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })

    })

    it('user can delete a social resource he/she created', () => {
        let resource = socialResources.findOne({})

        assert.ok(resource)

        return callWithPromise('deleteSocialResource', {
            projectId: resource._id
        }).then(data =>{
            let resource2 = socialResources.findOne({
                _id: resource._id
            })

            assert.notOk(resource2)
        })
    })

    after(function() {
        socialResources.remove({})
    })
})