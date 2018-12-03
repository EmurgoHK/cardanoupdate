import "./footer.html";
import "./footer.scss";

Template.footer.helpers({
  languages: () => {
    return _.union(Object.keys(TAPi18n.languages_names).map(key => {
        return {
          code: key,
          name: TAPi18n.languages_names[key][1],
          selected: key === TAPi18n.getLanguage()
        };
      }), [{
        code: 'new',
        name: TAPi18n.__('shared.add_language')
      }]);
  }
});

Template.footer.events({
  "change #selectLanguage"(event) {
    event.preventDefault();
    if (event.target.value === 'new') {
      FlowRouter.go('/translations')
    } else {
      TAPi18n.setLanguage(event.target.value);
    }
  }
});
