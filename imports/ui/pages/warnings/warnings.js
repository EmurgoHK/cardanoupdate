import './warnings.html'
 import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

Template.warnings.onCreated(function () {
    this.sort = new ReactiveVar('date-desc')
    this.searchFilter = new ReactiveVar(undefined);
    
    this.autorun(() => {
        this.subscribe('warnings')
    })
})
 Template.warnings.helpers({
    searchArgs() {
        const instance = Template.instance();
        return {
            placeholder: TAPi18n.__('warnings.main.search'),
            type: 'warnings',
            onChange: (newTerm) => instance.searchFilter.set(newTerm),
        }
    },
    resultArgs() {
        return {
            types: ['warnings'],
            searchTerm: Template.instance().searchFilter.get(),
            doLanguageGrouping: true,
            languages: Meteor.user() && Meteor.user().profile && Meteor.user().profile.contentLanguages,
        }
    },
})
 Template.warnings.events({
     'click #add-warning': (event, _) => {
        event.preventDefault()
        FlowRouter.go('/scams/new')
    },
})