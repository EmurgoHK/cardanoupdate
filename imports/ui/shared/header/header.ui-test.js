const assert = require('assert')
const baseUrl = 'http://localhost:3000/'

describe('Header when user isn\'t logged in', () => {
    before(() => {
        browser.url(baseUrl)
        browser.pause(5000)
    })

    it ('should have a sign in link', () => {
        assert(browser.isExisting('#signIn'), true)
        assert(browser.isVisible('#signIn'), true)
    })

    it ('should redirect to login when sign in is clicked', () => {
        browser.click('#signIn')
        browser.pause(3000)
        assert.equal(browser.getUrl(), 'http://localhost:3000/login')
        browser.url(baseUrl)
    })

    it('should hide sidebar when nav-bar toggler is clicked', () => {
        browser.click('button.d-none.d-lg-block')
        browser.pause(2000)
        assert(browser.isExisting('.sidebar'), false)
        assert(browser.isVisible('.sidebar'), false)
    })
})

describe('Header when user is logged in', () => {
    before(() => {
        browser.url(baseUrl)
        browser.pause(5000)

        browser.execute(() => {
            Meteor.call('generateTestUser', (err, data) => {})
            return 'ok'
        })

        browser.pause(5000)
        browser.execute(() => Meteor.loginWithPassword('testing', 'testing'))

        browser.pause(5000)
    })
    
    it ('should have a sign in link', () => {
        assert(browser.isExisting('#signOut'), true)
    })

    it('should hide sidebar when nav-bar toggler is clicked', () => {
        browser.click('button.d-none.d-lg-block')
        browser.pause(3000)
        
        assert(browser.isExisting('.sidebar'), false)
        assert(browser.isVisible('.sidebar'), false)
    })

    it ('should sign out user when signOut is clicked', () => {
        browser.click('#dropdownMenu2')
        browser.pause(1000)
        
        browser.click('#signOut')
        browser.pause(3000)

        assert(browser.isExisting('#js-facebook'), true)
        assert(browser.isVisible('#js-facebook'), true)
    })
})
