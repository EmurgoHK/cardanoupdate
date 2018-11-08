import './searchBar.html';
import './searchBar.scss';

Template.searchBar.onCreated(function() {
  this.searchTerm = new ReactiveVar([]);
});

Template.searchBar.helpers({
  placeholder: () => Template.currentData().placeholder,
  advancedSearchUrl: () => {
    const term = Template.instance().searchTerm.get();

    return `/search?q=${encodeURIComponent(term)}&type=${Template.currentData().type}`;
  }
});

Template.searchBar.events({
  'keyup/change #searchBox': (event, templateInstance) => {
    // Save it internally to update links
    templateInstance.searchTerm.set(templateInstance.$("#searchBox").val());

    // Communicate change up
    templateInstance.data.onChange(templateInstance.$("#searchBox").val())
  }
});