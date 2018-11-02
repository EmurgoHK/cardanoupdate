const assert = require('assert')
const baseUrl = 'http://localhost:3000'

describe('Candidates page', function () {
    before(() => {
        browser.url(`${baseUrl}/`)
        browser.pause(5000)

        browser.execute(() => {
            Meteor.call('generateTestCandidate', (err, data) => {})

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

    it('moderator can see candidates', function () {
        browser.url(`${baseUrl}/moderator/candidates`)
        browser.pause(5000)

        assert(browser.execute(() => $('.news-item').length > 0).value, true)
    })

    it('moderator can promote candidates', function () {
        let count = browser.execute(() => $('.news-item').length).value

        let _id = browser.execute(() => $('.card-title').find('a').attr('href').split('/')[2]).value

        browser.click('#js-promote')
        browser.pause(2000)

        let countN = browser.execute(() => $('.news-item').length).value

        assert(count === countN + 1, true)
        assert(browser.execute((_id) => Meteor.users.findOne({_id: _id}).moderator, _id), true)
    })
    
    after(() => {
        browser.execute(() => {
            Meteor.call('removeTestCandidate', (err, data) => {})

            return 'ok'
        })

        browser.pause(5000)
    })
})