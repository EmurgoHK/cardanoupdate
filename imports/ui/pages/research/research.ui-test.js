const assert = require('assert')
const baseUrl = 'http://localhost:3000'

const path = require('path')

describe('Research page', function () {
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

    it('user can add a new research paper', function () {
        browser.url(`${baseUrl}/research`)
        browser.pause(5000)

        browser.click('#new-research')

        browser.pause(3000)

        browser.setValue('#headline', 'Headline Test')
        browser.pause(1000)

        browser.click('.new-research')
        browser.pause(2000)

        assert(browser.execute(() => $('#abstractError').text().trim() === 'Abstract is required').value, true)

        browser.setValue('#abstract', 'Abstract Test')
        browser.pause(1000)

        const file = path.join(__dirname, '..', '..', '..', '..', 'public', 'pdf', 'test.pdf')

        browser.chooseFile('#fileInput', file)
        browser.pause(15000)

        assert(browser.execute(() => $('#fileUploadValue').text() === 'Change').value, true)
        assert(browser.execute(() => Array.from($('#preview a').map((i, el) => $(el).attr('href'))).length > 0).value, true)

        browser.click('.new-research')
        browser.pause(3000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'research').value, true)
    })

    it('user can edit research he/she created', () => {
        browser.execute(() => $('.news-settings').find('.dropdown-menu').addClass('show'))
        browser.pause(3000)

        browser.click('#js-edit')
        browser.pause(3000)

        browser.setValue('#headline', 'Headline Test 2')
        browser.pause(1000)

        browser.click('.new-research')
        browser.pause(3000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'research').value, true)

        assert(browser.execute(() => Array.from($('.card-title a')).some(i => $(i).text().trim() === 'Headline Test 2')).value, true)
    })

    it('user can read the research', () => {
        browser.execute(() => FlowRouter.go('/research/headline-test-1'))
        browser.pause(3000)

        assert(browser.execute(() => $('h1.card-title').text() === 'Headline Test 2').value, true)
        assert(browser.execute(() => $('.abstract').text().trim() === 'Abstract Test').value, true)
    })

    it('user can flag research', () => {
        browser.execute(() => $('.news-settings').find('.dropdown-menu').addClass('show'))
        browser.pause(3000)

        browser.click('.flag-research')
        browser.pause(2000)

        browser.setValue('.swal2-input', 'Test flag research')
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

    it('user can remove research he/she created', () => {
        browser.url(`${baseUrl}/research`)
        browser.pause(5000)

        let count = browser.execute(() => $('.card').length).value

        browser.execute(() => $('.news-settings').find('.dropdown-menu').addClass('show'))
        browser.pause(3000)

        browser.click('#js-remove')
        browser.pause(2000)

        browser.click('.swal2-confirm')
        browser.pause(3000)

        let countN = browser.execute(() => $('.card').length).value

        assert(count === countN + 1, true)
    })
})