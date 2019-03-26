import './learnForm.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Learn } from '/imports/api/learn/learn'
import { Tags } from '/imports/api/tags/tags'
import { TranslationGroups } from '../../../api/translationGroups/translationGroups';
import { notify } from '/imports/modules/notifier'

import { newLearningItem, editLearningItem } from '/imports/api/learn/methods'

import SimpleMDE from 'simplemde'

import _ from 'lodash'

import { insertImageModal } from '../../shared/mdeModals/insertImageModal'
import { insertVideoModal } from '../../shared/mdeModals/insertVideoModal';

const maxCharValue = (inputId) => {
  if (inputId === 'title') {
    return 90
  } else if (inputId === 'summary') {
    return 260
  } else {
    return 5000
  }
}

Template.learnForm.onCreated(function() {
	if (FlowRouter.current().route.name.startsWith('edit') || FlowRouter.current().route.name.startsWith('translate')) {
		this.autorun(() => {
			this.subscribe('learn.item', FlowRouter.getParam('slug'))
				
			this.subscribe('translationGroups.itemSlug', {slug: FlowRouter.getParam('slug'), contentType: 'learn'});
		})
	}

	this.autorun(() => {
		this.subscribe('tags')
		this.subscribe('embeddedImages');
	})
})

Template.learnForm.onRendered(function() {
    this.autorun(() => {
        let learn = Learn.findOne({
            slug: FlowRouter.getParam('slug')
        })

        //preselect the correct type if it's on the project edit page
        if (learn) {
			// Check the radio button for the existing difficulty level 
			this.$(`input[name="difficultyLevel"][value = ${learn.difficultyLevel}]`).prop("checked", true);
        }
    })
})

Template.learnForm.onRendered(function() {
  	this.mde = new SimpleMDE({
    	element: $("#content")[0],
    	toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'clean-block', 'link', {
      		name: 'insertImage',
      		action: insertImageModal,
      		className: 'fa fa-picture-o',
      		title: 'Insert image'
    	}, {
    		name: 'insertVideo',
    		action: insertVideoModal,
    		className: 'fa fa-file-video-o',
    		title: 'Insert YouTube video'
    	}, '|', 'preview', 'side-by-side', 'fullscreen', '|', 'guide'],
			previewRender: (content) => marked(content, {sanitize: true}),
  	})

  	window.mde = this.mde

	this.autorun(() => {
		let learn = Learn.findOne({
			slug: FlowRouter.getParam('slug')
		});
		if (learn) {
			this.mde.value(learn.content);

			// If dificulty level exist on editing
			if (learn.difficultyLevel) {
				// Check the radio button for the existing difficulty level 
				this.$(`input[name="difficultyLevel"][value = ${learn.difficultyLevel}]`).prop("checked", true);
			}
		}
	})
})

Template.learnForm.helpers({
	isNew: () => (FlowRouter.current().route.name.startsWith('new')),
	isEdit: () => (FlowRouter.current().route.name.startsWith('edit')),
	isTranslate: () => FlowRouter.current().route.name.startsWith('translate'),

	learn: () => Learn.findOne({
		slug: FlowRouter.getParam('slug')
  	}),
	learnTags: () => (Learn.findOne({ slug: FlowRouter.getParam('slug') }) || {}).tags || [],
	
	languages: () => {
		const group = TranslationGroups.findOne({});
		const isTranslate = FlowRouter.current().route.name.startsWith('translate');
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

Template.learnForm.events({
	'keyup .form-control': (event, templateInstance) => {
        event.preventDefault()

        let inputId = event.target.id
        let inputValue = event.target.value
        let inputMaxChars = maxCharValue(inputId) - parseInt(inputValue.length)
        let charsLeftText = `${inputMaxChars} ${TAPi18n.__('learn.form.chars_left')}`
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
    'click .new-learn': function(event, templateInstance) {
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
		const isTranslate = FlowRouter.current().route.name.startsWith('translate');
			if (FlowRouter.current().route.name === 'newLearn' || isTranslate) {
				const original = isTranslate ? FlowRouter.getParam('slug') : undefined;
				newLearningItem.call({
					title: $('#title').val(),
					summary: $('#summary').val(),
					content: templateInstance.mde.value(),
					captcha: captchaData,
					tags: tagsToSave,
					difficultyLevel: $('input[name="difficultyLevel"]:checked').val(),
					language: $("#language").val(),
					original,
				}, (err, data) => {
					if (!err) {
						notify(TAPi18n.__('learn.form.success_add'), 'success')

						FlowRouter.go('/learn')

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
		} else {
			let learn = Learn.findOne({
				slug: FlowRouter.getParam('slug')
			})

			console.log($('input[name="difficultyLevel"]:checked').val())
			editLearningItem.call({
				learnId: learn._id,
				title: $('#title').val(),
				summary : $('#summary').val(),
				content: templateInstance.mde.value(),
				captcha: captchaData,
				tags: tagsToSave,
				difficultyLevel : $('input[name="difficultyLevel"]:checked').val()
			}, (err, data) => {
				if (!err) {
					notify(TAPi18n.__('learn.form.success_edit'), 'success')

						FlowRouter.go('/learn')

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
	}
})
