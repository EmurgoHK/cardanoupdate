import { assert } from 'chai';
import { Meteor } from 'meteor/meteor';

import { TranslationGroups } from './translationGroups';
import { callWithPromise } from '/imports/api/utilities';

import {addTranslation, removeTranslation, updateTranslationSlug} from './methods';

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ _id: 'test-user', profile: { name: 'Test User'}, moderator: true }) // stub user data as well
Meteor.user = () => ({ _id: 'test-user', profile: { name: 'Test User'}, moderator: true })

describe('Translation group methods', function() {
    it('user can add a new translation for not translated content', () => {
        addTranslation({_id: 'asdf2', slug: 'noslug-1'}, 'en', 'testcontent');

        const newGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: 'asdf2'}}});
        assert.ok(newGroup);
        assert.deepInclude(newGroup.translations, {id: 'asdf2', slug: 'noslug-1', language: 'en'});
    });

    it('user can add a new translation for translated content with the original not in a group', () => {
        addTranslation({_id: 'asdf2', slug: 'noslug-1'}, 'jp', 'testcontent', {_id: 'asdf1', slug: 'noslug'});

        const newGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: 'asdf2'}}});
        assert.ok(newGroup);
        console.log(newGroup);
        assert.deepInclude(newGroup.translations, {id: 'asdf1', slug: 'noslug', language: 'en'});
        assert.deepInclude(newGroup.translations, {id: 'asdf2', slug: 'noslug-1', language: 'jp'});
    });

    it('user can add a new translation for translated content with an original', () => {
        addTranslation({_id: 'asdf1', slug: 'noslug'}, 'en', 'testcontent');
        addTranslation({_id: 'asdf2', slug: 'noslug-1'}, 'jp', 'testcontent', {_id: 'asdf1', slug: 'noslug'});

        const newGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: 'asdf2'}}});
        assert.ok(newGroup);
        console.log(newGroup);
        assert.deepInclude(newGroup.translations, {id: 'asdf1', slug: 'noslug', language: 'en'});
        assert.deepInclude(newGroup.translations, {id: 'asdf2', slug: 'noslug-1', language: 'jp'});
    });

    it('does not throw if removing translation for not translated content', () => {
        removeTranslation('asdfasdf');
    });

    it('can remove a translation ', () => {
        addTranslation({_id: 'asdf2', slug: 'noslug-1'}, 'jp', 'testcontent', {_id: 'asdf1', slug: 'noslug'});
        removeTranslation('asdf2');

        const newGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: 'asdf1'}}});
        assert.ok(newGroup);
        assert.deepInclude(newGroup.translations, {id: 'asdf1', slug: 'noslug', language: 'en'});
        assert.notDeepInclude(newGroup.translations, {id: 'asdf2', slug: 'noslug-1', language: 'jp'});
    });

    it('should update slugs', () => {
        addTranslation({_id: 'asdfxxx', slug: 'slug0'}, 'en', 'testcontent');
        addTranslation({_id: 'asdf2', slug: 'noslug-1'}, 'jp', 'testcontent', {_id: 'asdf1', slug: 'noslug'});
        addTranslation({_id: 'asdf3', slug: 'noslug-2'}, 'sr', 'testcontent', {_id: 'asdf1', slug: 'noslug'});

        updateTranslationSlug('asdf1', 'slug');

        const newGroup = TranslationGroups.findOne({translations: {$elemMatch: {id: 'asdf1'}}});
        assert.ok(newGroup);
        assert.deepInclude(newGroup.translations, {id: 'asdf1', slug: 'slug', language: 'en'});
        assert.deepInclude(newGroup.translations, {id: 'asdf2', slug: 'noslug-1', language: 'jp'});
        assert.deepInclude(newGroup.translations, {id: 'asdf3', slug: 'noslug-2', language: 'sr'});
    })

    afterEach(function() {
        TranslationGroups.remove({});
    });
});
