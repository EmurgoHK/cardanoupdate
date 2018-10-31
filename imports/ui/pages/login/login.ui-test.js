const assert = require('assert')
const baseUrl = 'http://localhost:3000/login'

describe('Sign in page', () => {
    it ('should show 3rd party service logins', () => {
        browser.url(baseUrl)
        browser.pause(6000)

        ;['facebook'].forEach(i => {
            assert(browser.isExisting(`#js-${i}`), true)
            assert(browser.isVisible(`#js-${i}`), true)
        })
    })

    it ('should have a \`Login\` header and subtitle', () => {
        browser.url(baseUrl)
        browser.pause(6000)

        assert(browser.isExisting('h1=Login'), true)
        assert(browser.isVisible('h1=Login'), true)

        assert(browser.isExisting('p=Sign In to your account'), true)
        assert(browser.isVisible('p=Sign In to your account'), true)
    })

    it ('should redirect to login when user has an account', () => {
        browser.url(baseUrl)
        browser.pause(6000)

        assert(browser.isExisting('#goToSignup'), true)
        assert(browser.isVisible('#goToSignup'), true)

        browser.click('#goToSignup')
        assert.equal(browser.getUrl(), 'http://localhost:3000/signup')
    })

    it ('should login user and redirect to home', () => {
        browser.url(baseUrl)
        browser.pause(6000)

        browser.execute(() => {
            Meteor.call('generateTestUser', (err, data) => {})
            return 'ok'
        })

        browser.pause(3000)

        browser.setValue('#email', 'testing@testing.test')
        browser.setValue('#password', 'testing')
        browser.click('button[type=submit]')
        
        browser.pause(3000)

        assert(browser.isExisting('#signOut'), true)

        browser.pause(3000)
        assert.equal(browser.getUrl(), 'http://localhost:3000/')
    })
})