const assert = require('assert')
const baseUrl = 'http://localhost:3000'

describe('News page', function () {
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

    it('user can add new news', function () {
        browser.click('#js-new')

        browser.pause(3000)

        browser.setValue('#headline', 'Headline Test')
        browser.pause(1000)
        browser.setValue('#summary', 'Summary test')
        browser.pause(1000)

        browser.click('.add-news')
        browser.pause(2000)

        assert(browser.execute(() => $('#bodyError').text().trim() === 'Body is required').value, true)

        browser.execute(() => { MDEdit.body.value('Body test') })
        browser.pause(1000)

        browser.click('.add-news')
        browser.pause(3000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'home').value, true)
    })

    it('user can edit news he/she created', () => {
        browser.execute(() => $('.news-settings').find('.dropdown-menu').addClass('show'))
        browser.pause(3000)

        browser.click('#js-edit')
        browser.pause(3000)

        browser.setValue('#headline', 'Headline Test 2')
        browser.pause(1000)

        browser.click('.add-news')
        browser.pause(3000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'home').value, true)

        assert(browser.execute(() => Array.from($('.news-item').find('.card-title a')).some(i => $(i).text().trim() === 'Headline Test 2')).value, true)
    })

    it('user can vote up/down on news', () => {
        let initial = browser.execute(() => $('.upvote-count').text()).value

        // downvote 
        browser.execute(() => $('.news-reputation').find('.vote-down').click())
        browser.pause(3000)

        // get vote count after downvote
        let upvoteCount = browser.execute(() => $('.upvote-count').text()).value
        let downvoteCount = browser.execute(() => $('.downvote-count').text()).value

        assert(parseInt(upvoteCount) === 1, true)
        assert(parseInt(downvoteCount) === 1, true)

        browser.pause(3000)

        // upvote
        browser.execute(() => $('.news-reputation').find('.vote-up').click())
        browser.pause(3000)

        // get vote count after upvote
        upvoteCount = browser.execute(() => $('.upvote-count').text()).value
        downvoteCount = browser.execute(() => $('.downvote-count').text()).value

        assert(parseInt(upvoteCount) === 2, true)
        assert(parseInt(downvoteCount) === 0, true)
    })

    it('user can read the news', () => {
        browser.execute(() => FlowRouter.go('/news/headline-test-1'))
        browser.pause(3000)

        assert(browser.execute(() => $('h1.card-title').text() === 'Headline Test 2').value, true)
        assert(browser.execute(() => $('.summary').text().trim() === 'Summary test').value, true)
        assert(browser.execute(() => $('.news-body').text().trim() === 'Body test').value, true)
    })

    it('user can flag a news item', () => {
        browser.execute(() => $('.news-settings').find('.dropdown-menu').addClass('show'))
        browser.pause(3000)

        browser.click('.flag-news')
        browser.pause(2000)

        browser.setValue('.swal2-input', 'Test flag news')
        browser.pause(1000)

        browser.click('.swal2-confirm')
        browser.pause(3000)
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

    it('user can remove news he/she created', () => {
        browser.url(`${baseUrl}/`)
        browser.pause(5000)

        let count = browser.execute(() => $('.news-item').length).value

        browser.execute(() => $('.news-settings').find('.dropdown-menu').addClass('show'))
        browser.pause(3000)

        browser.click('#js-remove')
        browser.pause(2000)

        browser.click('.swal2-confirm')
        browser.pause(3000)

        let countN = browser.execute(() => $('.news-item').length).value

        assert(count === countN + 1, true)
    })

    /*it('user can be suspended', () => {
        browser.execute(() => Meteor.call('toggleSuspended', (err, data) => {}))
        browser.pause(3000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'suspended').value, true)

        browser.execute(() => Meteor.call('toggleSuspended', (err, data) => {}))
        browser.pause(3000)
        browser.execute(() => FlowRouter.go('/'))
        browser.pause(5000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'home').value, true)
    })*/
})