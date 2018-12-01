import './search.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'
import './search.scss'

Template.search.onCreated(function() {
    this.typeFilters= new ReactiveVar([]);
    this.langFilters= new ReactiveVar(undefined);
    this.searchTerm = new ReactiveVar("");
    
    this.autorun(() => {
        const typeParam = FlowRouter.getQueryParam('type');
        const typeFilters =  typeParam !== undefined ? typeParam.split('-').filter(a => a) : [
            'projects',
            'events',
            'learn',
            'research',
            'warnings',
            'socialResources',
        ];
        this.typeFilters.set(typeFilters);
        
        const langParam = FlowRouter.getQueryParam('lang');
        const langFilters = langParam !== undefined ? langParam.split('-').filter(a => a) : Object.keys(TAPi18n.languages_names);
        this.langFilters.set(langFilters);

        this.searchTerm.set(FlowRouter.getQueryParam('q'));
    });
})

Template.search.helpers({
    showProjects: () => Template.instance().typeFilters.get().indexOf('projects') !== -1,
    
    showEvents: () => Template.instance().typeFilters.get().indexOf('events') !== -1,
    
    showLearn: () => Template.instance().typeFilters.get().indexOf('learn') !== -1,
    
    showResearch: () => Template.instance().typeFilters.get().indexOf('research') !== -1,
    
    showWarnings: () => Template.instance().typeFilters.get().indexOf('warnings') !== -1,
    
    showSocialResources: () => Template.instance().typeFilters.get().indexOf('socialResources') !== -1,

    searchArgs() {
        const instance = Template.instance();
        return {
            placeholder: TAPi18n.__('search.anything'),
            searchTerm: instance.searchTerm.get(),
            onChange: (newTerm) => {
                FlowRouter.setQueryParams({q: newTerm}); 
                instance.searchTerm.set(newTerm);
            },
        }
    },
    resultArgs: () => {
        const instance = Template.instance();
        return {
            searchTerm: instance.searchTerm.get(),
            types: instance.typeFilters.get(),
            displayTypeLabel: true,
            languages: instance.langFilters.get(),
        }
    },

    isLangChecked: (code) => Template.instance().langFilters.get().indexOf(code) !== -1,
    languages: () => {
        return Object.keys(TAPi18n.languages_names).map(key => ({
            code: key,
            name: TAPi18n.languages_names[key][1],
        }));
    },
})

Template.search.events({
    'click #projectCheckbox': (event, templateInstance) => {
        toggleTypeFilter(templateInstance, 'projects');
    },
    'click #eventsCheckbox': (event, templateInstance) => {
        toggleTypeFilter(templateInstance, 'events');
    },
    'click #learnCheckbox': (event, templateInstance) => {
        toggleTypeFilter(templateInstance, 'learn');
    },
    'click #researchCheckbox': (event, templateInstance) => {
        toggleTypeFilter(templateInstance, 'research');
    },
    'click #scamsCheckbox': (event, templateInstance) => {
        toggleTypeFilter(templateInstance, 'warnings');
    },
    'click #communityCheckbox': (event, templateInstance) => {
        toggleTypeFilter(templateInstance, 'socialResources');
    },
    'click .langFilter': (event, templateInstance) => {
        const filter = event.target.value;

        const filters = templateInstance.langFilters.get();
        const index = filters.indexOf(filter);
        // We push filter in if it wasn't present and remove it if it was
        if (index === -1)
            filters.push(filter)
        else 
            filters.splice(index, 1);
        
        templateInstance.langFilters.set(filters);
        // We save to a queryparam to preserve it after refresh
        // It's sorted to have consistent urls for filters
        FlowRouter.setQueryParams({'lang': filters.sort().join('-')});
    }
})

function toggleTypeFilter(templateInstance, filter) {
    const filters = templateInstance.typeFilters.get();
    const index = filters.indexOf(filter);
    
    // We push filter in if it wasn't present and remove it if it was
    if (index === -1)
        filters.push(filter)
    else 
        filters.splice(index, 1);
    
    templateInstance.typeFilters.set(filters);

    // We save to a queryparam to preserve it after refresh
    // It's sorted to have consistent urls for filters
    FlowRouter.setQueryParams({'type': filters.sort().join('-')});
}