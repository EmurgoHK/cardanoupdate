import './learnForm.html'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { Learn } from '/imports/api/learn/learn'
import { Tags } from '/imports/api/tags/tags'
import { notify } from '/imports/modules/notifier'

import { newLearningItem, editLearningItem } from '/imports/api/learn/methods'

import SimpleMDE from 'simplemde'
import swal from 'sweetalert2'

import { insertImage, replaceSelection } from '/imports/ui/shared/uploader/uploader'

export const insertVideo = editor => {
    const cm = editor.codemirror

    const state = SimpleMDE.prototype.getState.call(editor)
    const options = editor.options

    swal({
		title: 'Please provide YouTube video link',
		input: 'text',
		showCancelButton: true,
		inputValidator: (value) => {
		  	return !/youtu(\.|)be/.test(value) && 'Invalid YouTube video link!'
		}
	}).then(data => {
		if (data.value) {
			let videoId = data.value.match(/(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&"'>]+)/)[5] // fairly complex regex that extracts video id from the youtube link

			if (videoId && /[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]/.test(videoId)) { // videoId has certain constrains so we can check if it's valid
				replaceSelection(cm, state.video, ['<iframe width="560" height="315" ', 'src="#url#" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'], `https://www.youtube.com/embed/${videoId}`)
			} else {
				notify('Invalid YouTube video.', 'error')
			}
		}
	})
}

const maxCharValue = (inputId) => {
    if (inputId === 'title') {
    	return 25
    }

    return 5000
}

Template.learnForm.onCreated(function() {
	if (FlowRouter.current().route.name === 'editLearn') {
		this.autorun(() => {
			this.subscribe('learn.item', FlowRouter.getParam('slug'))
		})
	}

	this.newsTags = new ReactiveVar([])

	this.autorun(() => {
		this.subscribe('tags')
	})
})

Template.learnForm.onRendered(function() {
  	this.mde = new SimpleMDE({
    	element: $("#content")[0],
    	toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'clean-block', 'link', {
      		name: 'insertImage',
      		action: insertImage,
      		className: 'fa fa-picture-o',
      		title: 'Insert image'
    	}, {
    		name: 'insertVideo',
    		action: insertVideo,
    		className: 'fa fa-file-video-o',
    		title: 'Insert YouTube video'
    	}, '|', 'preview', 'side-by-side', 'fullscreen', '|', 'guide'],
  	})

  	window.mde = this.mde

  	this.autorun(() => {
    	let learn = Learn.findOne({
      		slug: FlowRouter.getParam('slug')
    	})

    	if (learn) {
      		this.mde.value(learn.content)
    	}
  	})
})

Template.learnForm.helpers({
	learn: () => Learn.findOne({
		slug: FlowRouter.getParam('slug')
  	}),
	add: () => !(FlowRouter.current().route.name === 'editLearn'),
	tags: () =>  Tags.find({}),
	tagsAsString: (tags) => tags == undefined || (tags !=undefined && tags.length > 0 && tags[0].id == undefined) ? [] : tags.map(t => { return t.name.toString().toUpperCase() }),
	tagDisabled: (name, tags) => {
		if (tags !== undefined) { // this will only be true for edit mode
			let tag = tags.find(t => { return name === t.name ? t : undefined });
			let newsTags = Template.instance().newsTags.get();

			if (tag !== undefined) { // check if the tag exists
				if (newsTags.some(t => { return tag.id === t.id })) { // check if the tag has already been added to newsTags
						newsTags.push({
							id: tag.id,
							name: tag.name
						});
						Template.instance().newsTags.set(newsTags);
				}
				return 'disabled';
			}
		}

		return '';
	}
})

Template.learnForm.events({
	'keyup .form-control': (event, templateInstance) => {
        event.preventDefault()

        let inputId = event.target.id
        let inputValue = event.target.value
        let inputMaxChars = maxCharValue(inputId) - parseInt(inputValue.length)
        let charsLeftText = `${inputMaxChars} characters left`

        $(`#${inputId}-chars`).text(charsLeftText)

        let specialCodes = [8, 46, 37, 39] // backspace, delete, left, right

        if (inputMaxChars <= 0) {
          	$(`#${inputId}`).keypress((e) => { return !!~specialCodes.indexOf(e.keyCode) })
          	return true
        }

        $(`#${inputId}`).unbind('keypress')
    },
	'click .tag-button': (event, templateInstance) => {
		let name = ($(event.currentTarget).find('.tag-name')[0]).innerHTML;
		let tagString = $('#tagInput').val()

		tagString = (tagString === undefined || tagString === '') ? name : `${tagString},${name}`;

		$('#tagInput').val(tagString)
		$(event.currentTarget).attr('disabled', true);

		let newsTags = templateInstance.newsTags.get();
		if (newsTags.every(a => a.id !== event.currentTarget.id)) { // check if the tag has already been added to newsTags
			newsTags.push({
				id: event.currentTarget.id,
				name: name.toUpperCase()
			});
			templateInstance.newsTags.set(newsTags)
		}
	},
	'keyup #tagInput': function(event, templateInstance){
		let inputs = templateInstance.$(event.currentTarget).val().split(',').map(a => a.trim().toUpperCase());

		let topTags = templateInstance.$('.tag-name').toArray().map(t => t.innerHTML)
		let topIds = templateInstance.$('.tag-name').toArray().map(t => t.parentElement.id)

		let newsTags = [];
		inputs.forEach(input => {
			// Add the tag to the object
			if (topTags.includes(input)) {
				if (!newsTags.some(a => a.name === input)) {
					newsTags.push({
						id: topIds[topTags.indexOf(input)],
						name: input,
					});
				}
			}
		});
		
		topTags.forEach((tagName, ind) => { // We disable tag buttons that are included in the inputs, enable all others
			$(`#${topIds[ind]}`).attr('disabled', inputs.includes(tagName));
		});

		templateInstance.newsTags.set(newsTags)
	},
    'click .new-learn': function(event, templateInstance) {
		event.preventDefault()

		let tags = $('#tagInput').val().split(',').map(e => e.trim()).filter(i => !!i)
		let newsTags = templateInstance.newsTags.get()

		// convert all tags to array of objects
		tags = tags.map(t => {
			let element = undefined

			if (newsTags.length > 0) element = newsTags.find(n => n.name === t.toUpperCase())
 			// add the element to the array if it not present
			if (element === undefined) {
				return { id: '', name: t.trim().toUpperCase()}
			}

			return element
		});

		// Deduplicating tags by name
		const tagsToSave = [];
		const addedTagNames = new Set();
		for (const tag of tags) {
			if (!addedTagNames.has(tag.name)) {
				addedTagNames.add(tag.name);
				tagsToSave.push(tag);
			}
		}

    	if (FlowRouter.current().route.name === 'newLearn') {
	    	newLearningItem.call({
	    		title: $('#title').val(),
	    		content: templateInstance.mde.value(),
	    		tags: tagsToSave
	    	}, (err, data) => {
	    		if (!err) {
	    			notify('Successfully added.', 'success')

	        		FlowRouter.go('/learn')

	        		return
	      		}

		      	if (err.details && err.details.length >= 1) {
		        	err.details.forEach(e => {
		          		$(`#${e.name}`).addClass('is-invalid')
		          		$(`#${e.name}Error`).show()
		          		$(`#${e.name}Error`).text(e.message)
		        	})
		      	}
	    	})
    	} else {
    		let learn = Learn.findOne({
    			slug: FlowRouter.getParam('slug')
    		})

    		editLearningItem.call({
    			learnId: learn._id,
	    		title: $('#title').val(),
	    		content: templateInstance.mde.value(),
	    		tags: tagsToSave
	    	}, (err, data) => {
	    		if (!err) {
	    			notify('Successfully edited.', 'success')

	        		FlowRouter.go('/learn')

	        		return
	      		}

		      	if (err.details && err.details.length >= 1) {
		        	err.details.forEach(e => {
		          		$(`#${e.name}`).addClass('is-invalid')
		          		$(`#${e.name}Error`).show()
		          		$(`#${e.name}Error`).text(e.message)
		        	})
		      	}
	    	})
    	}
    }
})
