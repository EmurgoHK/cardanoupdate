import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { Projects } from './projects'
import { TranslationGroups } from '../translationGroups/translationGroups';

import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'}, moderator: true }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'}, moderator: true })

describe('project methods', () => {
    it('user can add a new project', () => {
        return callWithPromise('addProject', {
            headline: 'Test headline',
            description: 'Test description',
            github_url: 'http://github.com/testuser/testrepo',
            type: 'built-on-cardano',
            captcha:'_test_captcha_',
            language: 'en',
        }).then(data => {
            let project = Projects.findOne({
                _id: data
            })

            assert.ok(project)

            assert.equal(project.headline, 'Test headline');
            assert.equal(project.description, 'Test description');
            assert.equal(project.github_url, 'http://github.com/testuser/testrepo');
            assert.equal(project.type, 'built-on-cardano');
            assert.equal(project.language, 'en');
      
            const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: data}}});
            assert.ok(translationGroup);
            assert.equal(translationGroup.contentType, 'project');
            assert.includeDeepMembers(translationGroup.translations, [
              {language: 'en', id: data, slug: project.slug},
            ]);
        })
    })

    it('user cannot add a new project if data is missing', () => {
        return callWithPromise('addProject', {
            headline: 'Test headline',
            description: ''
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can propose new data', () => {
        let project = Projects.findOne({})

        assert.ok(project)

        return callWithPromise('proposeNewData', {
            projectId: project._id,
            datapoint: 'website',
            newData: 'test',
            type: 'link'
        }).then(data => {
            let p2 = Projects.findOne({
                _id: project._id
            })

            assert.ok(p2.edits.length > 0)
            assert.ok(p2.edits[0].type === 'link')
            assert.ok(p2.edits[0].newData === 'test')
            assert.ok(p2.edits[0].datapoint === 'website')            
        })
    })

    it('moderator can approve proposed data', () => {
        let project = Projects.findOne({
            'edits.0': {
                $exists: true
            }
        })

        assert.ok(project)

        return callWithPromise('resolveProjectDataUpdate', {
            projectId: project._id,
            editId: project.edits[0]._id,
            decision: 'merge'
        }).then(data => {
            let p2 = Projects.findOne({
                _id: project._id
            })

            assert.ok(p2.edits[0].status === 'merged')
            assert.ok(p2[p2.edits[0].datapoint] === p2.edits[0].newData)
        })
    })

    it('user can add a translation of a project by id', () => {
      const original = Projects.findOne({});
      return callWithPromise('addProject', {
        headline: 'Test headline',
        description: 'Test description',
        github_url: 'http://github.com/testuser/testrepo',
        type: 'built-on-cardano',
        captcha:'_test_captcha_',
        language: 'sr',
        original: original._id,
      }).then(data => {
        let project = Projects.findOne({
          _id: data
        })
  
        assert.ok(project)

        assert.equal(project.headline, 'Test headline');
        assert.equal(project.description, 'Test description');
        assert.equal(project.github_url, 'http://github.com/testuser/testrepo');
        assert.equal(project.type, 'built-on-cardano');
        assert.equal(project.language, 'sr');
  
        const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: data}}});
        assert.ok(translationGroup);
        assert.equal(translationGroup.contentType, 'project');
        assert.includeDeepMembers(translationGroup.translations, [
          {language: 'sr', id: data, slug: project.slug},
          {language: original.language, id: original._id, slug: original.slug}
        ]);
      })
    });
  
    it('user can add a translation of a project by id if it was created before translations', () => {
      const originalId = Projects.insert({
        headline: 'Test headline old',
        slug: 'test-headline-old',
        description: 'Test description',
        github_url: 'http://github.com/testuser/testrepo',
        type: 'built-on-cardano',
        captcha:'_test_captcha_',
      });
      const original = Projects.findOne({_id: originalId});
  
      return callWithPromise('addProject', {
        headline: 'Test headline',
        description: 'Test description',
        github_url: 'http://github.com/testuser/testrepo',
        type: 'built-on-cardano',
        captcha:'_test_captcha_',
        language: 'sr',
        original: original._id,
      }).then(data => {
        let project = Projects.findOne({
          _id: data
        })
  
        assert.ok(project)

        assert.equal(project.headline, 'Test headline');
        assert.equal(project.description, 'Test description');
        assert.equal(project.github_url, 'http://github.com/testuser/testrepo');
        assert.equal(project.type, 'built-on-cardano');
        assert.equal(project.language, 'sr');

        const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: data}}});
        assert.ok(translationGroup);
        assert.equal(translationGroup.contentType, 'project');
        assert.includeDeepMembers(translationGroup.translations, [
          {language: 'sr', id: data, slug: project.slug},
          {language: 'en', id: original._id, slug: original.slug}
        ]);
      })
    });
    
    it('user can not add an project by wrong original id/slug', () => {
      return callWithPromise('addProject', {
        headline: 'Test headline',
        description: 'Test description',
        github_url: 'http://github.com/testuser/testrepo',
        type: 'built-on-cardano',
        captcha:'_test_captcha_',
        language: 'en',
        original: 'nope',
      }).then(data => {
        assert.fail('', '', 'Did not throw');
      }, err => {
        assert(err, 'messages.originalNotFound');
      })
    })

    it('user can edit a project', () => {
        let project = Projects.findOne({})

        assert.ok(project)

        return callWithPromise('editProject', {
            projectId: project._id,
            headline: 'Test headline 2',
            description: 'Test description 2',
            github_url: 'http://github.com/testuser/testrepo',
            website: 'http://test.test',
            type: 'built-for-cardano',
            captcha:'_test_captcha_'
        }).then(data => {
            let project2 = Projects.findOne({
                _id: project._id
            })

            assert.ok(project2)

            assert.equal(project2.headline, 'Test headline 2')
            assert.equal(project2.description, 'Test description 2')
            assert.equal(project2.github_url, 'http://github.com/testuser/testrepo')
            assert.equal(project2.website, 'http://test.test')
            assert.equal(project2.type, 'built-for-cardano')

            const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: project._id}}});
            assert.ok(translationGroup);
            assert.equal(translationGroup.contentType, 'project');
            assert.deepInclude(translationGroup.translations, {language: project.language, id: project._id, slug: project2.slug});
        })
    })

    it('user cannot edit a project the he/she didn\'t create', () => {
        let project = Projects.insert({
            headline: 'a',
            description: 'b',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(project)

        return callWithPromise('editProject', {
            projectId: project,
            headline: 'Test headline 2',
            description: 'Test description 2',
            github_url: 'http://github.com/testuser/testrepo',
            website: 'test web',
            captcha:'_test_captcha_'
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can remove a project', () => {
        let project = Projects.findOne({
            headline: 'Test headline 2'
        })

        assert.ok(project)

        return callWithPromise('deleteProject', {
            projectId: project._id
        }).then(data => {
            let project2 = Projects.findOne({
                _id: project._id
            })

            assert.notOk(project2)
            assert.notOk(TranslationGroups.findOne({translations: {$elemMatch: {id: project._id}}}));
        })
    })

    it('user cannot remove a project that he/she didn\'t create', () => {
        let project = Projects.findOne({})

        assert.ok(project)

        return callWithPromise('deleteProject', {
            projectId: project._id
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can flag a project', () => {
        let project = Projects.insert({
            headline: 'a',
            description: 'b',
            github_url: 'c',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(project)

        return callWithPromise('flagProject', {
            projectId: project,
            reason: 'Test reason'
        }, (err, data) => {
            let p2 = Projects.findOne({
                _id: project
            })

            assert.ok(p2)

            assert.ok(p2.flags.length > 0)
            assert.ok(p2.flags[0].reason === 'Test reason')
        })
    })

    it('moderator can remove a flagged project', () => {
        let project = Projects.findOne({
            flags: {
                $exists: true
            }
        })

        assert.ok(project)

        return callWithPromise('resolveProjectFlags', {
            projectId: project._id,
            decision: 'remove'
        }, (err, data) => {
            let p2 = Projects.findOne({
                _id: project._id
            })

            assert.notOk(p2)
        })
    })

    after(function() {
        Projects.remove({})
    })
})
