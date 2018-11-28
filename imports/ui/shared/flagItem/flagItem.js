import './flagItem.html'
import './flagItem.scss'

Template.flagItem.helpers({
	languageName: (code) => TAPi18n.languages_names[code][1],
});