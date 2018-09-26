import './newsForm.html'
import './news.scss'

import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { News } from '/imports/api/news/news'
import { notify } from '/imports/modules/notifier'

import { addNews, editNews } from '/imports/api/news/methods'

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

MDEditBeforeRender.body=function(next){
  next('body');
} //A hook before render, please don't forget next(id); !


Template.newsForm.helpers({
	news: () => News.findOne({
		_id: FlowRouter.getParam('id')
  }),

  add: () => FlowRouter.current().route.name === 'editNews' ? false : true

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
    	if (FlowRouter.current().route.name === 'addNews') {
	    	addNews.call({
	    		headline: $('#headline').val(),
	    		summary: $('#summary').val(),
	    		body: MDEdit.body.value(),
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
	    		body: MDEdit.body.value(),
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