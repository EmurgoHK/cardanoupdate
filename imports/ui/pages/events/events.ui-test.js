const assert = require('assert')
const baseUrl = 'http://localhost:3000'

describe('Events page', function () {
    before(() => {
        browser.url(`${baseUrl}/`)
        browser.pause(5000)

        browser.execute(() => {
            Meteor.call('generateTestUser', (err, data) => {})
            return 'ok'
        })

        browser.pause(5000)

        browser.execute(() => Meteor.loginWithPassword('testing', 'testing'))

        browser.pause(10000)
    })

    it('user can add a new event', function () {
        browser.url(`${baseUrl}/events`)
        browser.pause(5000)

        browser.click('#add-event')

        browser.pause(3000)

        browser.setValue('#headline', 'Headline Test')
        browser.pause(1000)

        browser.click('.add-event')
        browser.pause(2000)

        assert(browser.execute(() => $('#descriptionError').text().trim() === 'Description is required').value, true)

        browser.execute(() => { window.mde.value('Description Test') })
        browser.pause(1000)

        browser.setValue('#location', 'Novi Sad, S')
        browser.pause(1000)
        browser.click('.pac-item')
        browser.pause(2000)

        browser.setValue('#rsvp', 'test')
        browser.pause(1000)

        browser.click('.add-event')
        browser.pause(3000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'events').value, true)
    })

    it('user can edit a event he/she created', () => {
        browser.execute(() => $($('.fa-ellipsis-h').get(0)).trigger('click'))
        browser.pause(3000)

        browser.click('#js-edit')
        browser.pause(3000)

        browser.setValue('#headline', 'Headline Test 2')
        browser.pause(1000)

        browser.click('.add-event')
        browser.pause(3000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'events').value, true)

        assert(browser.execute(() => Array.from($('.card-title a')).some(i => $(i).text().trim() === 'Headline Test 2')).value, true)
    })

    it('user can see event info', () => {
        browser.execute(() => FlowRouter.go('/events/headline-test-1'))
        browser.pause(3000)

        assert(browser.execute(() => $('h1.card-title').text() === 'Headline Test 2').value, true)
    })

    it('user can comment', () => {
        browser.setValue('#comments', 'Test comment')
        browser.pause(2000)

        browser.click('.new-comment')
        browser.pause(3000)

        assert(browser.execute(() => Array.from($('.comments').find('.card-body span')).some(i => $(i).text().includes('Test comment'))).value, true)
    })

    it('user can reply to a comment', () => {
        browser.click('.reply')
        browser.pause(2000)

        let comment = browser.execute(() => testingComments.findOne()).value

        browser.setValue(`.rep-comment-${comment._id}`, 'Test reply')
        browser.pause(1000)

        browser.click('.reply-comment')
        browser.pause(3000)

        assert(browser.execute(() => Array.from($('.comments').find('.card-body span')).some(i => $(i).text().includes('Test reply'))).value, true)
    })

    it('user can edit a comment', () => {
        browser.execute(() => $('.news-settings').find('.dropdown-menu').addClass('show'))
        browser.pause(3000)

        browser.click('.edit-mode')
        browser.pause(2000)

        let comment = browser.execute(() => testingComments.findOne()).value

        browser.setValue(`.edit-comment-${comment._id}`, 'Test comment 2')
        browser.pause(1000)

        browser.click('.edit-comment')
        browser.pause(3000)

        assert(browser.execute(() => Array.from($('.comments').find('.card-body span')).some(i => $(i).text().includes('Test comment 2'))).value, true)
    })

    it('user can flag a comment', () => {
        browser.execute(() => $('.news-settings').find('.dropdown-menu').addClass('show'))
        browser.pause(3000)

        browser.click('.flag-comment')
        browser.pause(2000)

        browser.setValue('.swal2-input', 'Test flag')
        browser.pause(1000)

        browser.click('.swal2-confirm')
        browser.pause(3000)
    })

    it('user can remove a comment', () => {
        let count = browser.execute(() => $('.comments').find('.card').length).value

        browser.execute(() => $('.news-settings').find('.dropdown-menu').addClass('show'))
        browser.pause(3000)

        browser.click('.delete-comment')
        browser.pause(2000)

        browser.click('.swal2-confirm')
        browser.pause(2000)

        let countN = browser.execute(() => $('.comments').find('.card').length).value

        assert(count === countN + 1, true)
    })

    it('user can remove a event he/she created', () => {
        browser.url(`${baseUrl}/events`)
        browser.pause(5000)

        let count = browser.execute(() => $('.card').length).value

        browser.execute(() => $($('.fa-ellipsis-h').get(0)).trigger('click'))
        browser.pause(2000)

        browser.click('#js-remove')
        browser.pause(2000)

        browser.click('.swal2-confirm')
        browser.pause(3000)

        let countN = browser.execute(() => $('.card').length).value

        assert(count === countN + 1, true)
    })
})