import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { socialResources } from './socialResources'
import { Tags } from '../tags/tags';
import { TranslationGroups } from '../translationGroups/translationGroups';

import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ _id: 'test-user', profile: { name: 'Test User'}, moderator: true }) // stub user data as well
Meteor.user = () => ({ _id: 'test-user', profile: { name: 'Test User'}, moderator: true })

describe('social resources methods', () => {
    let resourceIdNotOwned;

    before(function () {
        resourceIdNotOwned = socialResources.insert({
            Name: 'Temp Resource',
            description: 'Temp Resource',
            createdBy: 'temp'
        })
    })

    it('user can create a social resource', () => {
        return callWithPromise('addSocialResource', {
            Name: 'Test Resource',
            description: 'Test Resource',
            Resource_url: 'https://gitter.im/meteor/meteor',
            tags: [{name: 'testTag'}],
            captcha:'_test_captcha_',
            language: 'en',
        }).then(data => {
            let resource = socialResources.findOne({
                _id: data
            });

            assert.ok(resource)
            assert.equal(resource.Name, 'Test Resource');
            assert.equal(resource.description, 'Test Resource');
            assert.equal(resource.Resource_url, 'https://gitter.im/meteor/meteor');
            assert.isArray(resource.tags);
            assert.lengthOf(resource.tags, 1);
            assert.equal(resource.tags[0].name, 'testTag');
            assert.equal(resource.resourceUrlType, 'GITTER');
      
            const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: data}}});
            assert.ok(translationGroup);
            assert.equal(translationGroup.contentType, 'socialResource');
            assert.includeDeepMembers(translationGroup.translations, [
              {language: 'en', id: data},
            ]);
        })
    })

    it('user can create a social resource without tags', () => {
        return callWithPromise('addSocialResource', {
            Name: 'Test Resource',
            description: 'Test Resource',
            Resource_url: 'test',
            captcha:'_test_captcha_',
            language: 'en',
        }).then(data => {
            let resource = socialResources.findOne({
                _id: data
            });

            assert.ok(resource);

            assert.equal(resource.Name, 'Test Resource');
            assert.equal(resource.description, 'Test Resource');
            assert.equal(resource.Resource_url, 'test');
      
            const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: data}}});
            assert.ok(translationGroup);
            assert.equal(translationGroup.contentType, 'socialResource');
            assert.includeDeepMembers(translationGroup.translations, [
              {language: 'en', id: data},
            ]);
        })
    })

    it('user cannot add a social resource if data is missing', () => {
        return callWithPromise('addSocialResource', {
            Name: 'Test Resource',
            captcha:'_test_captcha_'
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can add a translation of a social resource by id', () => {
      const original = socialResources.findOne({});
      return callWithPromise('addSocialResource', {
        Name: 'Test Resource',
        description: 'Test Resource',
        Resource_url: 'https://gitter.im/meteor/meteor',
        tags: [{name: 'testTag'}],
        captcha:'_test_captcha_',
        language: 'sr',
        original: original._id,
      }).then(data => {
        let resource = socialResources.findOne({
          _id: data
        })
  
        assert.ok(resource)

        assert.equal(resource.Name, 'Test Resource');
        assert.equal(resource.description, 'Test Resource');
        assert.equal(resource.Resource_url, 'https://gitter.im/meteor/meteor');
  
        const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: data}}});
        assert.ok(translationGroup);
        assert.equal(translationGroup.contentType, 'socialResource');
        assert.includeDeepMembers(translationGroup.translations, [
          {language: 'sr', id: data},
          {language: original.language || 'en', id: original._id},
        ]);
      })
    });
  
    it('user can add a translation of a social resource by id if it was created before translations', () => {
      const originalId = socialResources.insert({
        Name: 'Test Resource',
        description: 'Test Resource',
        Resource_url: 'https://gitter.im/meteor/meteor',
        captcha:'_test_captcha_',
      });
      const original = socialResources.findOne({_id: originalId});
  
      return callWithPromise('addSocialResource', {
        Name: 'Test Resource',
        description: 'Test Resource',
        Resource_url: 'https://gitter.im/meteor/meteor',
        tags: [{name: 'testTag'}],
        captcha:'_test_captcha_',
        language: 'sr',
        original: original._id,
      }).then(data => {
        let resource = socialResources.findOne({
          _id: data
        })
  
        assert.ok(resource)

        assert.equal(resource.Name, 'Test Resource');
        assert.equal(resource.description, 'Test Resource');
        assert.equal(resource.Resource_url, 'https://gitter.im/meteor/meteor');

        const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: data}}});
        assert.ok(translationGroup);
        assert.equal(translationGroup.contentType, 'socialResource');
        assert.includeDeepMembers(translationGroup.translations, [
          {language: 'sr', id: data},
          {language: 'en', id: original._id}
        ]);
      })
    });
    
    it('user can not add a social resource by wrong original id/slug', () => {
      return callWithPromise('addSocialResource', {
        Name: 'Test Resource',
        description: 'Test Resource',
        Resource_url: 'https://gitter.im/meteor/meteor',
        tags: [{name: 'testTag'}],
        captcha:'_test_captcha_',
        language: 'en',
        original: 'nope',
      }).then(data => {
        assert.fail('', '', 'Did not throw');
      }, err => {
        assert(err, 'messages.originalNotFound');
      })
    })

    it('user can edit a social resource he/she created adding new tags', () => {
        let resource = socialResources.findOne({
            'tags.0': {
                $exists: true
            }
        })
        let tags = Tags.find({}).fetch();

        assert.ok(resource);

        const newTags = Array.from(resource.tags || []);
        newTags.push({name: 'TestTag2'});

        return callWithPromise('editSocialResource', {
            projectId: resource._id,
            Name: 'Test Resource 2',
            description: 'Test Resource 2',
            Resource_url: 'test 2',
            tags: newTags,
            captcha:'_test_captcha_'
        }).then(data =>{
            let resource2 = socialResources.findOne({
                _id: resource._id,
            });

            assert.ok(resource2);

            assert.equal(resource2.Name, 'Test Resource 2');
            assert.equal(resource2.description, 'Test Resource 2');
            assert.equal(resource2.Resource_url, 'test 2');

            assert.lengthOf(resource2.tags, 2);

            // We also test that it properly adds mentions
            let updatedTags = Tags.find({}).fetch();
            for (const tag of resource2.tags) {
                const oldTag = tags.find(t => t._id === tag.id);
                const updatedTag = updatedTags.find(t => t._id === tag.id);
                
                if (oldTag) {
                    assert.equal(oldTag.mentions, updatedTag.mentions);
                } else {
                    assert.equal(updatedTag.mentions, 1);
                }
            }
        })
    })

    it('user cannot edit a social resource he/she did\'t create',() => {
        let resource = socialResources.insert({
            Name: 'Temp Resource',
            description: 'Temp Resource',
            createdBy: 'temp',
            captcha:'_test_captcha_'
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
        return callWithPromise('deleteSocialResource', {
            projectId: resourceIdNotOwned,
            captcha:'_test_captcha_'
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })

    })

    it('user can delete a social resource he/she created', () => {
        let resource = socialResources.findOne({
            createdBy: Meteor.userId()
        })

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

    it('can refresh guessed social media url type', () => {
        return callWithPromise('updateResourceUrlTypes', {}).then(() => {
            const resource = socialResources.findOne({_id:resourceIdNotOwned});

            assert.ok(resource.resourceUrlType);
            assert.equal(resource.resourceUrlType, 'UNKNOWN');
        });
    });

    it('user can flag a social resource', () => {
        return callWithPromise('flagSocialResource', {
            socialResourceId: resourceIdNotOwned,
            reason: 'Test reason'
        }, (err, data) => {
            let flaggedResource = socialResources.findOne({
                _id: resourceIdNotOwned
            })

            assert.ok(flaggedResource)

            assert.ok(flaggedResource.flags.length > 0)
            assert.ok(flaggedResource.flags[0].reason === 'Test reason')
        })
    })

    it('moderator can remove a flagged social resource', () => {
        return callWithPromise('resolveSocialResourceFlags', {
            socialResourceId: resourceIdNotOwned,
            decision: 'remove'
        }, (err, data) => {
            let n2 = Learn.findOne({
                _id: resourceIdNotOwned
            })

            assert.notOk(n2)
        })
    })

    after(function() {
        socialResources.remove({})
        Tags.remove({});
    })
})