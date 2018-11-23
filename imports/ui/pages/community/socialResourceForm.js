import './socialResourceForm.html'
import { Template } from 'meteor/templating'
import { addSocialResource, editSocialResource } from '/imports/api/socialResources/methods'
import { notify } from '/imports/modules/notifier'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { socialResources } from '/imports/api/socialResources/socialResources'
import { TranslationGroups } from '../../../api/translationGroups/translationGroups';
import { Tags } from '../../../api/tags/tags';

import _ from 'lodash'

const maxCharValue = (inputId) => {
    if (inputId === 'Name') { return 90 }

    return 260
}

Template.socialResourceFormTemp.onCreated(function() {
	if (FlowRouter.current().route.name.startsWith('edit') || FlowRouter.current().route.name.startsWith('translate')) {
		this.autorun(() => {
            this.subscribe('socialResources.item', FlowRouter.getParam('id'))
            this.subscribe('translationGroups.item', FlowRouter.getParam('id'));
		})
    }
    
	this.autorun(() => {
		this.subscribe('tags')
	});
})

Template.socialResourceFormTemp.onRendered(function() {

    $('#tags').select2({
        tags: true,
        tokenSeparators: [' ', ','],
        allowClear: true,
        placeholder: TAPi18n.__('community.form.tags_placeholder')
    })
})


Template.socialResourceFormTemp.helpers({
    Resource: () => {return socialResources.findOne({ _id: FlowRouter.getParam('id') })},
    socialTags: () => (socialResources.findOne({ _id: FlowRouter.getParam('id') }) || {}).tags || [],
	
    isNew: () => (FlowRouter.current().route.name.startsWith('new')),
    isEdit: () => (FlowRouter.current().route.name.startsWith('edit')),
    isTranslate: () => FlowRouter.current().route.name.startsWith('translate'),
    
    languages: () => {
        const group = TranslationGroups.findOne({});
        const isTranslate =  FlowRouter.current().route.name.startsWith('translate');
        return Object.keys(TAPi18n.languages_names).map(key => {
            const hasTranslation = group ? group.translations.some(t => t.language === key) : key === 'en';
            return {
                code: key,
                name: TAPi18n.languages_names[key][1],
                selected: !hasTranslation && key === TAPi18n.getLanguage(),
                disabled: isTranslate && hasTranslation,
            };
        });
	},
})

Template.socialResourceFormTemp.events({
    'keyup .form-control' (event, _tpl) {
        event.preventDefault()

        let inputId = event.target.id
        let inputValue = event.target.value
        let inputMaxChars = maxCharValue(inputId) - parseInt(inputValue.length)
        let charsLeftText = `${inputMaxChars} ${TAPi18n.__('community.form.chars_left')}`

        $(`#${inputId}-chars`).text(charsLeftText)

        let specialCodes = [8, 46, 37, 39] // backspace, delete, left, right

        if (inputMaxChars <= 0) {
          	$(`#${inputId}`).keypress((e) => { return !!~specialCodes.indexOf(e.keyCode) })
          	return true
        }
        // Remove validation error, if exists
        $(`#${inputId}`).removeClass('is-invalid')
        $(`#${inputId}`).unbind('keypress')
    },
    'click .add-socialResource' (event, templateInstance) {
        event.preventDefault()
        
        var captchaData = grecaptcha.getResponse();

		let tags = $('#tags').val()

		// convert all tags to array of objects
		tags = tags.map(t => {
			let element = Tags.findOne({
                name: t.trim().toUpperCase()
            })

 			// add the element to the array if it not present
			if (!element) {
				return {
                    id: '',
                    name: t.trim().toUpperCase()
                }
			}

			return {
                id: element._id,
                name: element.name
            }
        })

		// Deduplicating tags by name
		const tagsToSave = [];
		const addedTagNames = new Set();
		for (const tag of tags) {
			if (!addedTagNames.has(tag.name)) {
				addedTagNames.add(tag.name);
				tagsToSave.push(tag);
			}
		}

        if (FlowRouter.current().route.name === 'editSocialResource') {
            editSocialResource.call({
    			projectId: FlowRouter.getParam('id'),
	    		Name: $('#Name').val(),
                Resource_url: $('#Resource_url').val() || '',
                description: $('#description').val(),
                captcha: captchaData,
                tags: tagsToSave,
	    	}, (err, _data) => {
	    		if (!err) {
	    			notify(TAPi18n.__('community.form.success_edit'), 'success')
	        		FlowRouter.go('/community')
	        		return
	      		}

		      	if (err.details && err.details.length >= 1) {
		        	err.details.forEach(e => {
		          		$(`#${e.name}`).addClass('is-invalid')
		          		$(`#${e.name}Error`).show()
		          		$(`#${e.name}Error`).text(TAPi18n.__(e.message))
		        	})
		      	}
	    	})

            return
        }

        const original = FlowRouter.current().route.name.startsWith('translate') ? FlowRouter.getParam('id') : undefined;

        addSocialResource.call({
            Name: $('#Name').val(),
            description: $('#description').val(),
            Resource_url: $('#Resource_url').val() || '',
            captcha: captchaData,
            tags: tagsToSave,
            language: $('#language').val(),
            original,
        }, (err, data) => {
            if (!err) {
                notify(TAPi18n.__('community.form.success_add'), 'success')
                FlowRouter.go('/community')
                return
            }

            if (err.details === undefined && err.reason) {
                notify(TAPi18n.__(err.reason), 'error')
                return
            }

            if (err.details && err.details.length >= 1) {
                err.details.forEach(e => {
                    $(`#${e.name}`).addClass('is-invalid')
                    $(`#${e.name}Error`).show()
                    $(`#${e.name}Error`).text(TAPi18n.__(e.message))
                })
            }
        })
    }
})
