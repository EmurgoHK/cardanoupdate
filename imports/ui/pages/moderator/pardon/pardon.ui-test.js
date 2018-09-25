const assert = require('assert')
const baseUrl = 'http://localhost:3000'

describe('Pardon requests page', function () {
    before(() => {
        browser.url(`${baseUrl}/`)
        browser.pause(5000)

        browser.execute(() => {
            Meteor.call('generateTestPardon', (err, data) => {})

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

    it('moderator can see a pardon request', function () {
        browser.url(`${baseUrl}/moderator/pardon`)
        browser.pause(5000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'pardonUser').value, true)

        assert(browser.execute(() => $('.card').length > 0).value, true)
    })

    it('moderator can vote on pardon request', function () {
        browser.click('.js-vote')
        browser.pause(3000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'pardon').value, true)
    })

    after(() => {
        browser.execute(() => {
            Meteor.call('removeTestPardon', (err, data) => {})

            return 'ok'
        })

        browser.pause(5000)
    })
})