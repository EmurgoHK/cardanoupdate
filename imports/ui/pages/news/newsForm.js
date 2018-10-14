import './newsForm.html'
import './news.scss'

import SimpleMDE from 'simplemde'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { News } from '/imports/api/news/news'
import { notify } from '/imports/modules/notifier'

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
	if (FlowRouter.current().route.name === 'editNews') {
		this.autorun(() => {
			this.subscribe('news.item', FlowRouter.getParam('id'))
		})
	}
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
	  tagsAsString: (tags) => tags == undefined ? [] : tags.toString()	  
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
    'click .add-news': function(event, templateInstance) {
		event.preventDefault()

        let tags = $('#tagInput').val().split(',')
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