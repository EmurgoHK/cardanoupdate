import './researchForm.html'
import './researchForm.scss';

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Research } from '/imports/api/research/research'
import { TranslationGroups } from '../../../api/translationGroups/translationGroups';
import { notify } from '/imports/modules/notifier'

import { newResearch, editResearch } from '/imports/api/research/methods'

import '/imports/ui/shared/progressiveUploader/uploader'
import { ResearchFiles } from '../../../api/research/research';

const maxCharValue = (inputId) => {
  if (inputId === 'headline') {
    return 160
  }
}

Template.researchForm.onCreated(function() {
	this.links = new ReactiveVar([]);
	this.pdfId = new ReactiveVar(undefined);

	if (FlowRouter.current().route.name.startsWith('edit') || FlowRouter.current().route.name.startsWith('translate')) {
		this.subscribe('translationGroups.itemSlug', {slug: FlowRouter.getParam('slug'), contentType: 'research'});
		this.subscribe('research.item', FlowRouter.getParam('slug'), () => {
			const research = Research.findOne({slug: FlowRouter.getParam('slug')});

			if (research && research.links) {
				this.links.set(research.links.concat(this.links.get()));
			}

			if (research && research.pdfId)
				this.pdfId.set(research.pdfId);
		});
	}
});

Template.researchForm.helpers({
	isNew: () => FlowRouter.current().route.name.startsWith('new'),
	isEdit: () => FlowRouter.current().route.name.startsWith('edit'),
	isTranslate: () => FlowRouter.current().route.name.startsWith('translate'),

	links: () => Template.instance().links.get(),
	research: () => Research.findOne({
		slug: FlowRouter.getParam('slug')
	}),
	pdf: () => { // Pdf uploaded using the old method
		if (FlowRouter.current().route.name.startsWith('edit') || FlowRouter.current().route.name.startsWith('translate')) {
			let research = Research.findOne({
				slug: FlowRouter.getParam('slug')
			});
			
			if (research && research.pdf && !Template.instance().pdfId.get()) {
				return research.pdf
			}

			return undefined;
		}

		return undefined;
	},

	uploaderOptions: () => {
		const research = Research.findOne({
			slug: FlowRouter.getParam('slug')
		});
		const instance = Template.instance();
		return {
			collection: ResearchFiles,
			files: research && research.pdfId ? ResearchFiles.find({_id: research.pdfId}).fetch() : [],
			showFileList: true,
			showDelete: true,
			single: true,
			fileDelete: () => instance.pdfId.set(undefined),
			fileAdded: (id) => {
				notify(TAPi18n.__('research.form.success_file_upload'));
				instance.pdfId.set(id);
			}
		}
	},


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

Template.researchForm.events({
	'keyup #abstract, keyup #headline': (event, templateInstance) => {
        event.preventDefault()

        let inputId = event.target.id
        let inputValue = event.target.value
        let inputMaxChars = maxCharValue(inputId) - parseInt(inputValue.length)
        let charsLeftText = `${inputMaxChars} ${TAPi18n.__('research.form.chars_left')}`

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
    'click .new-research': function(event, templateInstance) {
		event.preventDefault()
			var captchaData = grecaptcha.getResponse();

			const isTranslate = FlowRouter.current().route.name.startsWith('translate');

			if (FlowRouter.current().route.name === 'newResearch' || isTranslate) {
				const original = isTranslate ? FlowRouter.getParam('slug') : undefined;

				newResearch.call({
					headline: $('#headline').val(),
					abstract: $('#abstract').val(),
					links: templateInstance.links.get(),
					captcha: captchaData,
					language: $('#language').val(),
					original,
					pdfId: templateInstance.pdfId.get(),
				}, (err, data) => {
					if (!err) {
						notify(TAPi18n.__('research.form.success_add'), 'success')

						FlowRouter.go('/research')

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
    		let research = Research.findOne({
    			slug: FlowRouter.getParam('slug')
    		})
				console.log('!!!', templateInstance.pdfId.get() ? undefined : research.pdf);
    		editResearch.call({
    			researchId: research._id,
	    		headline: $('#headline').val(),
					abstract: $('#abstract').val(),
					// We overwrite/remove the link to the old upload only if there is something replacing it.
					pdf: templateInstance.pdfId.get() ? undefined : research.pdf,
					links: templateInstance.links.get(),
					captcha: captchaData,
					pdfId: templateInstance.pdfId.get(),
	    	}, (err, data) => {
	    		if (!err) {
	    			notify(TAPi18n.__('research.form.success_edit'), 'success')
						FlowRouter.go('/research')
						return;
					}
					debugger
					if (err.details && err.details.length >= 1) {
						err.details.forEach(e => {
								console.log(e);
								$(`#${e.name.replace(/\./g, '_')}`).addClass('is-invalid')
								$(`#${e.name.replace(/\./g, '_')}Error`).show()
								$(`#${e.name.replace(/\./g, '_')}Error`).text(TAPi18n.__(e.message))
						})
					}
	    	})
    	}
		},

	'keyup .form-control.linkUrl': function(event, templateInstance) {
		const links = templateInstance.links.get();
		const index = Number.parseInt(event.currentTarget.dataset["index"]);
		links[index].url = event.currentTarget.value;
		templateInstance.links.set(links);
	},
	'keyup .form-control.linkDisplayName': function(event, templateInstance) {
		const links = templateInstance.links.get();
		const index = Number.parseInt(event.currentTarget.dataset["index"]);
		links[index].displayName = event.currentTarget.value;
		templateInstance.links.set(links);
	},
	'click #add-link': function(event, templateInstance) {
		event.preventDefault()

		const links = templateInstance.links.get();
		links.push({url: '', displayName: ''});
		templateInstance.links.set(links);
	},
	'click .remove-link': function(event, templateInstance) {
		event.preventDefault()
		
		const links = templateInstance.links.get();
		const index = Number.parseInt(event.currentTarget.dataset["index"]);
		links.splice(index, 1);
		templateInstance.links.set(links);
	}
})
