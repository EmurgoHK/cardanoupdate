import { TranslationGroups } from "./translationGroups";

/** @typedef {{_id: String, slug: String}} MongoDoc */
/**
 * Sets up a translation group or adds the new id to an already present group.
 * @param {MongoDoc} newDoc Mongo document of the new translation
 * @param {String} language Language code of the new content
 * @param {String} contentType Type of the content (e.g.: project)
 * @param {MongoDoc?} original Mongo document of the original content. It may be undefined if the new document wasn't a translation
 */
export function addTranslation(newDoc, language, contentType, original) {
  // If we received the id of the original we try to find the translation group it belongs to
  const old = original && TranslationGroups.findOne({translations: {$elemMatch: {id: original._id}}, contentType});
  if (old) {
    // If we could find it we just add the new document with the associated language into it
    return TranslationGroups.update({_id: old._id}, {$addToSet: {translations: {id: newDoc._id, slug: newDoc.slug, language}}});
  } else { 
    // If we couldn't find a group this belongs to we set up a new one
    const translations = [{id: newDoc._id, slug: newDoc.slug, language}];

    // We have on original document but it's not in any translation group.
    // This can only be the case if the content was created before we implemented translations
    if (original) 
      translations.push({id: original._id, slug: original.slug, language: 'en'}); // We assume all old content is in English.

    return TranslationGroups.insert({translations, contentType});
  }
};

/**
 * Removes a content id from translation groups
 * @param {String} id Content id
 */
export function removeTranslation(id) {
  TranslationGroups.update({translations: {$elemMatch: {id}}}, {$pull: {translations: {id}}});
}

export function checkTranslation(original, language) {
  return TranslationGroups.findOne({$and: [{translations: {$elemMatch: {id: original._id}}}, {translations: {$elemMatch: {language}}}]})
}

export function updateTranslationSlug(id, slug) {
  TranslationGroups.update({translations: {$elemMatch: {id}}}, {$set: {"translations.$.slug": slug}});
}