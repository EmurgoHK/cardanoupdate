import './searchBar.html';
import './searchBar.scss';
import { FlowRouter } from 'meteor/kadira:flow-router'

Template.searchBar.onCreated(function() {
    this.searchTerm = new ReactiveVar(this.data.searchTerm);
});

Template.searchBar.helpers({
    placeholder: () =>
        Template.currentData().placeholder,
    searchTerm: () =>
        Template.instance().searchTerm.get(),
    advancedSearchUrl: () => {
        let term = Template.instance().searchTerm.get();
        term = (term && term.trim().length > 0) ? term : '';
        return `/search?q=${encodeURIComponent(term)}&type=${Template.currentData().type}`;
    }
});

Template.searchBar.events({
    'keyup/change #searchBox': (event, templateInstance) => {
        // Save it internally to update links
        templateInstance.searchTerm.set(templateInstance.$("#searchBox").val());

        // Communicate change up
        templateInstance.data.onChange(templateInstance.$("#searchBox").val())
    },
    'click .search-bar-cross': (event, templateInstance) =>{
    	// Initially clear search bar.
    	$("#searchBox").val('');
    	// Trigger change event so process further processes
    	$("#searchBox").trigger('keyup');

    	// Advance search remove if found
    	// first check using pathname in window object
    	let pathname = window.location.pathname;
    	if(pathname && pathname == '/search'){
    		let trimmedSearch = window.location.search.substring(1);

			let searchFromLocation = trimmedSearch?JSON.parse(
			   '{"' + trimmedSearch.replace(/&/g, '","').replace(/=/g,'":"') + '"}', 
			    function(key, value) { 
			       return key===""?value:decodeURIComponent(value) 
			    }
			)
			:
			{}
    		let routeType = searchFromLocation.type ? searchFromLocation.type.trim() : null ;
    		if(routeType && routeType.length > 0){
    			FlowRouter.go('/'+routeType);
    		} else {
                FlowRouter.go('/');
            }
    	}

    }
});