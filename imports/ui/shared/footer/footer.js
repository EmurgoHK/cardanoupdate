import "./footer.html";
import "./footer.scss";

Template.footer.helpers({
  languages: () => {
    return Object.keys(TAPi18n.languages_names).map(key => {
      return {
        code: key,
        name: TAPi18n.languages_names[key][1],
        selected: key === TAPi18n.getLanguage()
      };
    });
  }
});

Template.footer.events({
  "change #selectLanguage"(event) {
    event.preventDefault();
    TAPi18n.setLanguage(event.target.value);
  }
});
