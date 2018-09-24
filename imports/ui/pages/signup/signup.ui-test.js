const assert = require('assert')
const baseUrl = 'http://localhost:3000/signup'

const testEmail = () => {
  // generate a random string with @test.com domain
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10) + '@test.com'
}

describe('Sign up page', () => {
  it('should have a \`register\` header and subtitle', () => {
    browser.url(baseUrl)
    browser.pause(6000)

    assert(browser.isExisting('h1=Register'), true)
    assert(browser.isVisible('h1=Register'), true)

    assert(browser.isExisting('p=Create your account'), true)
    assert(browser.isVisible('p=Create your account'), true)
  })

  it('should redirect to login when user has an account', () => {
    browser.url(baseUrl)
    browser.pause(6000)

    assert(browser.isExisting('#goToLogin'), true)
    assert(browser.isVisible('#goToLogin'), true)

    browser.click('#goToLogin')
    browser.pause(3000)
    assert.equal(browser.getUrl(), 'http://localhost:3000/login')
  })

  it('should register new user and redirect to home', () => {
    browser.url(baseUrl)
    browser.pause(6000)
    browser.setValue('#name', 'Test User')
    browser.pause(1000)
    browser.setValue('#email', testEmail())
    browser.pause(1000)
    browser.setValue('#password', '1234')
    browser.pause(1000)
    browser.setValue('#confirmPassword', '1234')
    browser.pause(3000)
    browser.click('button[type=submit]')

    browser.pause(3000)

    // we expect user to get logged in and redirected to home
    assert(browser.isExisting('#signOut'), true)
    assert(browser.isVisible('#signOut'), true)

    browser.pause(3000)
    assert.equal(browser.getUrl(), 'http://localhost:3000/')
  })
})