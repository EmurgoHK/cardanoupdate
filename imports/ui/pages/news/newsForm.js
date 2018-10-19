import './newsForm.html'
import './news.scss'

import SimpleMDE from 'simplemde'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { News } from '/imports/api/news/news'
import { notify } from '/imports/modules/notifier'

import { Tags } from '/imports/api/tags/tags'

import { addNews, editNews } from '/imports/api/news/methods'

import '/imports/ui/shared/uploader/uploader'
import { getFiles, insertImage } from '/imports/ui/shared/uploader/uploader'

const maxCharValue = (inputId) => {
    if (inputId === 'headline') {
    	return 140
    } else if (inputId === 'summary') {
    	return 500
    }

    return 5000
}

Template.newsForm.onCreated(function() {
	this.newsTags = new ReactiveVar([]);
	this.autorun(() => {
		if (FlowRouter.current().route.name === 'editNews') {
			this.subscribe('news.item', FlowRouter.getParam('id'))
		}
		this.subscribe('tags')
	})
})

Template.newsForm.onRendered(function() {
	this.mde = new SimpleMDE({
		element: $("#body")[0],
		toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'clean-block', 'link', {
            name: 'insertImage',
            action: insertImage,
            className: 'fa fa-picture-o',
            title: 'Insert image',
        }, '|', 'preview', 'side-by-side', 'fullscreen', '|', 'guide'],
	})

	window.mde = this.mde

	this.autorun(() => {
		let news = News.findOne({
			_id: FlowRouter.getParam('id')
	  	})

		if (news) {
			this.mde.value(news.body)
		}
	})
})

Template.newsForm.helpers({
	news: () => News.findOne({
		_id: FlowRouter.getParam('id')
  	}),
  	add: () => FlowRouter.current().route.name === 'editNews' ? false : true,
  	images: () => {
  		if (FlowRouter.current().route.name === 'editNews') {
  			let news = News.findOne({
				_id: FlowRouter.getParam('id')
  			}) || {}

  			if (news && news.image) {
  				return [news.image]
  			}

  			return []
  		}

  		return []
	  },
	  tags: () =>  Tags.find({}),
	  tagsAsString: (tags) => tags == undefined || (tags !=undefined && tags.length > 0 && tags[0].id == undefined) ? [] : tags.map(t => { return t.name.toString().toUpperCase() }),
	  tagDisabled: (name, tags) => {

		if (tags != undefined) { // this will only be true for edit mode
			let tag = tags.find(t => { return name == t.name ? t : undefined });
			let newsTags = Template.instance().newsTags.get();

			if (tag != undefined) { // check if the tag exists in the top 10 tags
				
				if (newsTags.find(t => { return tag.id == t.id }) == undefined) { // check if the tag has already been added to newsTags
					
					newsTags.push({
						id: tag.id,
						name: tag.name
				   })
   
				   Template.instance().newsTags.set(newsTags)
				}
				
				return 'disabled'
			}
			return ''
		} 

		return ''
	  }
})

Template.newsForm.events({
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
		
		newsTags.push({
			id: event.currentTarget.id,
			name: name.toUpperCase()
		})
		templateInstance.newsTags.set(newsTags)
	},
	'keyup #tagInput': function(event, templateInstance){
		let inputs = $(event.currentTarget).val().split(',')
		let topTags = $('.tag-name').toArray().map(t => t.innerHTML)
		let topIds = $('.tag-name').toArray().map(t => t.parentElement.id)
		
		$('.tag-button').attr('disabled', false);

		let newsTags = [];
		inputs.forEach(input => {
			// Add the tag to the object
			input = input.trim();
			if (topTags.includes(input.toUpperCase())) {
				let addedTag = {
					id: topIds[topTags.indexOf(input.toUpperCase())],
					name: input.toUpperCase()
				}
				$(`#${addedTag.id}`).attr('disabled', true);
				newsTags.push(addedTag)
			}
		})

		templateInstance.newsTags.set(newsTags)
	},
    'click .add-news': function(event, templateInstance) {
		event.preventDefault()

		let tags = $('#tagInput').val().split(',').map(e => e.trim())
		let newsTags = templateInstance.newsTags.get();
		
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

    	if (FlowRouter.current().route.name === 'addNews') {
	    	addNews.call({
	    		headline: $('#headline').val(),
	    		summary: $('#summary').val(),
	    		body: templateInstance.mde.value(),
				  image: getFiles()[0] || '',
				  tags: tags
	    	}, (err, data) => {
	    		if (!err) {
	    			notify('Successfully added.', 'success')

	        		FlowRouter.go('/')

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
    		editNews.call({
    			newsId: FlowRouter.getParam('id'),
	    		headline: $('#headline').val(),
	    		summary: $('#summary').val(),
	    		body: templateInstance.mde.value(),
				  image: getFiles()[0] || '',
				  tags: tags
	    	}, (err, data) => {
	    		if (!err) {
	    			notify('Successfully edited.', 'success')

	        		FlowRouter.go('/')

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