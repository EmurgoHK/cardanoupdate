import './userNameDisplay.html';

Template.userNameDisplay.helpers({
  log: () => console.log(this, Template.currentData()),
  // Return data.profile.name defaulting to 'No name' if undefined
  name: () => ((Template.currentData() || {}).profile || {}).name || TAPi18n.__('shared.user.no_name'),
})