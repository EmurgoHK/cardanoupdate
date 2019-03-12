import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { notify } from '/imports/modules/notifier'

import './translations.html'

import { Translations } from '/imports/api/translations/translations'

import swal from 'sweetalert2'
import xss from 'xss'

const flatten = (source, flattened = {}, keySoFar = '') => {
  	const getNextKey = (key) => `${keySoFar}${keySoFar ? '.' : ''}${key}`

  	if (typeof source === 'object') {
    	for (const key in source) {
      		flatten(source[key], flattened, getNextKey(key))
    	}
  	} else {
    	flattened[keySoFar] = source
  	}

  	return flattened
}

export { flatten }

Template.translations.onCreated(function() {
	this.scopes = new ReactiveVar([])
	this.currentData = new ReactiveVar({})
	this.currentLanguage = new ReactiveVar({})
	this.translatedData = new ReactiveVar({})

	Meteor.call('getLanguageScopes', 'en', (err, data) => {
		this.scopes.set(data)
	})

	this.autorun(() => {
		this.subscribe('langs')
	})

  // const action = FlowRouter.getQueryParam('action')
	this.addNew = new ReactiveVar(false)
})

// Template.translations.onRendered(function() {
//   Meteor.defer(function () {
//     FlowRouter.setQueryParams({ 'action': null })
//   })
// })

Template.translations.helpers({
	langs: () => {
    //
    FlowRouter.watchPathChange()
    const action = FlowRouter.getQueryParam('action')
    if (action && action == 'new') {
      Meteor.defer(function () {
        $('#pageSelectLanguage').val('new').trigger('change')
        FlowRouter.setQueryParams({ 'action': null })
      })
    }
    //
		let langs = Object.keys(TAPi18n.languages_names).filter(i => i !== 'en') // english shouldn't be on the list
		let langsFallback = Translations.findOne({
			_id: 'languages'
		}) || {}

		langs = _.union(langs, Object.keys(langsFallback.langs || {})) // fallback

		return _.union(langs.sort().map(i => {
			let lang = TAPi18n.languages_names[i] || []

			return {
				code: i,
				name: lang[1] || langsFallback.langs[i]
			}
		}), {
			code: 'new',
			name: TAPi18n.__('shared.add_language')
		})
	},
	addNew: () => Template.instance().addNew.get(),
	scopes: () => {
		return Template.instance().scopes.get()
	},
	translations: () => {
		let data = Template.instance().currentData.get()
		let translated = Template.instance().translatedData.get()

		if (data && data.data) {
			data = flatten(data.data)
		}

		if (translated) {
			translated = flatten(translated)
		}

		if (Object.keys(data).length && Object.keys(Template.instance().currentLanguage.get()).length) {
			return Object.keys(data).map(i => ({
				key: i,
				english: data[i],
				translated: translated[i] || ''
			}))
		}

		return []
	},
	language: () => Template.instance().currentLanguage.get().name || ''
})

Template.translations.events({
    'change .view-scope': (event, templateInstance) => {
    	event.preventDefault()

    	Meteor.call('getLanguageData', $(event.currentTarget).val(), 'en', (err, data) => {
    		if (!err) {
	    		templateInstance.currentData.set({
	    			scope: $(event.currentTarget).val(),
	    			data: data
	    		})
    		} else {
    			templateInstance.currentData.set({})
    		}
    	})

    	if (templateInstance.currentLanguage.get().key) {
    		Meteor.call('getLanguageData', $(event.currentTarget).val(),  templateInstance.currentLanguage.get().key, (err, data) => {
	    		if (!err) {
		    		templateInstance.translatedData.set(data)
	    		} else {
	    			templateInstance.translatedData.set({})
	    		}
	    	})
    	}
	},
	'click .add-lang': (event, templateInstance) => {
		event.preventDefault()

		Meteor.call('addLanguage', $('#js-code').val(), $('#js-lang-name').val(), (err, data) => {
			if (!err) {
				templateInstance.addNew.set(false)
			} else {
				notify(TAPi18n.__(err.reason || err.message), 'error')
			}
		})
	},
	'click .cancel': (event, templateInstance) => {
		event.preventDefault()

		templateInstance.addNew.set(false)
	},
	'change .language': (event, templateInstance) => {
		event.preventDefault()

		if ($(event.currentTarget).val() === 'new') {
			templateInstance.addNew.set(true)
		} else {
      templateInstance.addNew.set(false)
			templateInstance.currentLanguage.set({
				key: $(event.currentTarget).val(),
				name: $(event.currentTarget).find('option:selected').text()
			})

			Meteor.call('getLanguageData', templateInstance.currentData.get().scope,  $(event.currentTarget).val(), (err, data) => {
	    		if (!err) {
		    		templateInstance.translatedData.set(data)
	    		} else {
	    			templateInstance.translatedData.set({})
	    		}
	    	})
		}
	},
	'click .save-data': (event, templateInstance) => {
		event.preventDefault()

		let data = {}
		Array.from($('input')).forEach(el => {
			let e = $(el)

			if (e.val()) {
				data[e.attr('id')] = xss(e.val()) // sanitize html
			}
		})

		Meteor.call('saveLanguageData', templateInstance.currentData.get().scope, templateInstance.currentLanguage.get().key, templateInstance.currentLanguage.get().name, data, (err, data) => {
			if (!err) {
				swal('Successfully saved.')

				$('.view-scope').val('-')
				templateInstance.currentData.set({})
			}
		})
	}
})
