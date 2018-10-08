const assert = require('assert')
const baseUrl = 'http://localhost:3000'

describe('Changes page', function () {
    before(() => {
        browser.url(`${baseUrl}/`)
        browser.pause(5000)

        browser.execute(() => {
            Meteor.call('generateTestChanges', (err, data) => {})

            return 'ok'
        })

        browser.pause(5000)

        browser.execute(() => {
            Meteor.call('generateTestUser', (err, data) => {})

            return 'ok'
        })

        browser.pause(5000)

        browser.execute(() => Meteor.loginWithPassword('testing', 'testing'))

        browser.pause(10000)
    })

    it('moderator can see changed items', function () {
        browser.url(`${baseUrl}/moderator/changes`)
        browser.pause(5000)

        assert(browser.execute(() => $('.news-item').length > 0).value, true)
    })

    it('moderator can reject changed items', function () {
        let count = browser.execute(() => $('.news-item').length).value

        browser.click('#js-reject')
        browser.pause(2000)

        let countN = browser.execute(() => $('.news-item').length).value

        assert(count === countN + 1, true)
    })
    
    it('moderator can merge changed items', function () {
        let count = browser.execute(() => $('.news-item').length).value

        let slug = browser.execute(() => $('.card-title').attr('href').split('/')[2]).value

        browser.click('#js-merge')
        browser.pause(2000)

        let countN = browser.execute(() => $('.news-item').length).value

        assert(count === countN + 1, true)
        assert(browser.execute((slug) => testingProjects.findOne({slug: slug}).github_url === 'https://testing.com', slug), true)
    })

    after(() => {
        browser.execute(() => {
            Meteor.call('removeTestChanges', (err, data) => {})

            return 'ok'
        })

        browser.pause(5000)
    })
})