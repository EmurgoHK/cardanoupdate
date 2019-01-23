import './home.html'
import './home.scss'
import _ from 'lodash'

import { Template } from 'meteor/templating'
import { Projects } from '/imports/api/projects/projects'
import { Warnings } from '/imports/api/warnings/warnings';
import { Events } from '/imports/api/events/events'
import { Research } from '/imports/api/research/research'
import { Learn } from '/imports/api/learn/learn'
import { socialResources } from '/imports/api/socialResources/socialResources'
import { UsersStats } from '/imports/api/user/usersStats'
import { Stats } from '/imports/api/stats/stats'
import { ReactiveVar } from 'meteor/reactive-var';

let selectedLang = new ReactiveVar([]);

Template.home.onCreated(function () {
  this.autorun(() => {
    this.subscribe('research')
    this.subscribe('socialResources')
    this.subscribe('projects')
    this.subscribe('events')
    this.subscribe('users')
    this.subscribe('comments')
    this.subscribe('usersStats')
    this.subscribe('warnings')
    this.subscribe('learn')
    this.subscribe('stats')
  })
})

Template.home.onRendered(function(){
  this.autorun(() => {
    let languages = [];
    if(Meteor.user() && Meteor.user().profile && Meteor.user().profile.contentLanguages) {
      languages = Meteor.user() && Meteor.user().profile && Meteor.user().profile.contentLanguages
      selectedLang.set(languages)
    } else {
      // Set default language
      selectedLang.set(["en"])
    }
  })
})

Template.home.helpers({
  // Stats
  totalProject: () => (Stats.findOne('content') || {}).projects,

  totalLearningContent: () => (Stats.findOne('content') || {}).learn,

  totalResearch: () => (Stats.findOne('content') || {}).research,

  resultArgs: () => ({
    types: ['events', 'learn', 'projects', 'research', 'socialResources', 'warnings'],
    searchTerm: undefined,
    displayTypeLabel: true,
    hidePastEvents: true,
    showAddNew: true,
    typeLimit: 6,
    languages: selectedLang.get(),
    addNewCallback: () => {
      $('#newModal').modal('show')
    }
  }),

  languages: () => {
    let languages;
    if(Meteor.user) {
      languages = Meteor.user() && Meteor.user().profile && Meteor.user().profile.contentLanguages
    }
    return _.union(Object.keys(TAPi18n.languages_names).map(key => {
      return {
        code: key,
        name: TAPi18n.languages_names[key][1],
        selected: _.includes(selectedLang.get(), key)
      };
    }));
  }
})

Template.home.events({
  'change .languages input' (event) {
    event.preventDefault();
    let languages = []
    $('.languages input:checked').each(function() {
      languages = [...languages, $(this).attr('id')]
    })
    selectedLang.set(languages)
  }
})