import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'

import { Research } from './research'
import { TranslationGroups } from '../translationGroups/translationGroups';

import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ _id: 'test-user', profile: { name: 'Test User'}, moderator: true }) // stub user data as well
Meteor.user = () => ({ _id: 'test-user', profile: { name: 'Test User'}, moderator: true })

describe('research methods', () => {
    it('user can add a new research item with links', () => {
        return callWithPromise('newResearch', {
            headline: 'Test headline',
            abstract: 'Test abstract',
            pdf: '/test.pdf',
            captcha:'_test_captcha_',
            links: [
                {url: 'https://google.com', displayName: 'google'},
            ],
            language: 'en',
        }).then(data => {
            let research = Research.findOne({
                _id: data
            })

            assert.ok(research)

            assert.equal(research.headline, 'Test headline');
            assert.equal(research.abstract, 'Test abstract');
            assert.equal(research.pdf, '/test.pdf');
            assert.equal(research.language, 'en');

            assert.ok(research.links);
            assert.lengthOf(research.links, 1);
            assert.equal(research.links[0].url, "https://google.com");
            assert.equal(research.links[0].displayName, "google");
      
            const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: data}}});
            assert.ok(translationGroup);
            assert.equal(translationGroup.contentType, 'research');
            assert.includeDeepMembers(translationGroup.translations, [
              {language: 'en', id: data, slug: research.slug},
            ]);
        })
    })

    it('user can add a new research item', () => {
        return callWithPromise('newResearch', {
            headline: 'Test headline',
            abstract: 'Test abstract',
            pdf: '/test.pdf',
            captcha:'_test_captcha_',
            language: 'en',
        }).then(data => {
            let research = Research.findOne({
                _id: data
            })

            assert.ok(research)

            assert.equal(research.headline, 'Test headline');
            assert.equal(research.abstract, 'Test abstract');
            assert.equal(research.pdf, '/test.pdf');
            assert.equal(research.language, 'en');
      
            const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: data}}});
            assert.ok(translationGroup);
            assert.equal(translationGroup.contentType, 'research');
            assert.includeDeepMembers(translationGroup.translations, [
              {language: 'en', id: data, slug: research.slug},
            ]);
        })
    })

    it('user cannot add a new research item if data is missing', () => {
        return callWithPromise('newResearch', {
            headline: 'Test headline',
            abstract: '',
            captcha:'_test_captcha_'
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can add a translation of a research by id', () => {
      const original = Research.findOne({});
      return callWithPromise('newResearch', {
        headline: 'Test headline',
        abstract: 'Test abstract',
        pdf: '/test.pdf',
        captcha:'_test_captcha_',
        language: 'sr',
        original: original._id,
      }).then(data => {
        let research = Research.findOne({
          _id: data
        })
  
        assert.ok(research)

        assert.equal(research.headline, 'Test headline');
        assert.equal(research.abstract, 'Test abstract');
        assert.equal(research.pdf, '/test.pdf');
        assert.equal(research.language, 'sr');
  
        const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: data}}});
        assert.ok(translationGroup);
        assert.equal(translationGroup.contentType, 'research');
        assert.includeDeepMembers(translationGroup.translations, [
          {language: 'sr', id: data, slug: research.slug},
          {language: original.language, id: original._id, slug: original.slug}
        ]);
      })
    });
  
    it('user can add a translation of a research by id if it was created before translations', () => {
      const originalId = Research.insert({
        headline: 'Test headline old',
        abstract: 'Test abstract',
        pdf: '/test.pdf',
        captcha:'_test_captcha_',
      });
      const original = Research.findOne({_id: originalId});
  
      return callWithPromise('newResearch', {
        headline: 'Test headline',
        abstract: 'Test abstract',
        pdf: '/test.pdf',
        captcha:'_test_captcha_',
        language: 'sr',
        original: original._id,
      }).then(data => {
        let research = Research.findOne({
          _id: data
        })
  
        assert.ok(research)

        assert.equal(research.headline, 'Test headline');
        assert.equal(research.abstract, 'Test abstract');
        assert.equal(research.pdf, '/test.pdf');
        assert.equal(research.language, 'sr');

        const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: data}}});
        assert.ok(translationGroup);
        assert.equal(translationGroup.contentType, 'research');
        assert.includeDeepMembers(translationGroup.translations, [
          {language: 'sr', id: data, slug: research.slug},
          {language: 'en', id: original._id, slug: original.slug}
        ]);
      })
    });
    
    it('user can not add an research by wrong original id/slug', () => {
      return callWithPromise('newResearch', {
        headline: 'Test headline',
        abstract: 'Test abstract',
        pdf: '/test.pdf',
        captcha:'_test_captcha_',
        language: 'en',
        original: 'nope',
      }).then(data => {
        assert.fail('', '', 'Did not throw');
      }, err => {
        assert(err, 'messages.originalNotFound');
      })
    })

    it('user can edit a research item', () => {
        let research = Research.findOne({})

        assert.ok(research)

        return callWithPromise('editResearch', {
            researchId: research._id,
            headline: 'Test headline 2',
            abstract: 'Test abstract 2',
            pdf: '/test2.pdf',
            captcha:'_test_captcha_'
        }).then(data => {
            let research2 = Research.findOne({
                _id: research._id
            })

            assert.ok(research2)

            assert.ok(research2.headline === 'Test headline 2')
            assert.ok(research2.abstract === 'Test abstract 2')
            assert.ok(research2.pdf === '/test2.pdf')

            const translationGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: research._id}}});
            assert.ok(translationGroup);
            assert.equal(translationGroup.contentType, 'research');
            assert.deepInclude(translationGroup.translations, {language: research.language, id: research._id, slug: research2.slug});
        })
    })

    it('user cannot edit a research item the he/she didn\'t create', () => {
        let research = Research.insert({
            headline: 'a',
            abstract: 'b',
            pdf: 'c',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(research)

        return callWithPromise('editResearch', {
            researchId: research,
            headline: 'Test headline 2',
            abstract: 'Test abstract 2',
            pdf: '/test2.pdf',
            captcha:'_test_captcha_'
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can remove a research item', () => {
        let research = Research.findOne({
            headline: 'Test headline 2'
        })

        assert.ok(research)

        return callWithPromise('removeResearch', {
            researchId: research._id
        }).then(data => {
            let research2 = Research.findOne({
                _id: research._id
            })

            assert.notOk(research2)
            assert.notOk(TranslationGroups.findOne({translations: {$elemMatch: {id: research._id}}}));
        })
    })

    it('user cannot remove a research item that he/she didn\'t create', () => {
        let research = Research.findOne({})

        assert.ok(research)

        return callWithPromise('removeResearch', {
            researchId: research._id
        }).then(data => {}).catch(error => {
            assert.ok(error)
        })
    })

    it('user can flag a research item', () => {
        let research = Research.insert({
            headline: 'a',
            abstract: 'b',
            pdf: 'c',
            createdBy: 'not-me',
            createdAt: new Date().getTime()
        })

        assert.ok(research)

        return callWithPromise('flagResearch', {
            researchId: research,
            reason: 'Test reason'
        }, (err, data) => {
            let n2 = Research.findOne({
                _id: research
            })

            assert.ok(n2)

            assert.ok(n2.flags.length > 0)
            assert.ok(n2.flags[0].reason === 'Test reason')
        })
    })

    it('moderator can remove a flagged research item', () => {
        let research = Research.findOne({
            flags: {
                $exists: true
            }
        })

        assert.ok(research)

        return callWithPromise('resolveResearchFlags', {
            researchId: research._id,
            decision: 'remove'
        }, (err, data) => {
            let n2 = Research.findOne({
                _id: research._id
            })

            assert.notOk(n2)
        })
    })

    after(function() {
        Research.remove({})
    })
})
