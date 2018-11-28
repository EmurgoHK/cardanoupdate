import { Meteor } from 'meteor/meteor'
import { TranslationGroups } from '../translationGroups';

Meteor.publish('translationGroups', () => TranslationGroups.find({}));
Meteor.publish('translationGroups.item', (id) => TranslationGroups.find({translations: {$elemMatch: {id}}}));
Meteor.publish('translationGroups.itemSlug', (slug) => TranslationGroups.find({translations: {$elemMatch: {slug}}}));
