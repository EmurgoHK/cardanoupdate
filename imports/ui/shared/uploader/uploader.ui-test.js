const assert = require('assert')
const baseUrl = 'http://localhost:3000/add'

const path = require('path')

describe('Uploader', function () {
    before(() => {
        browser.url(`http://localhost:3000/`)
        browser.pause(5000)

        browser.execute(() => {
            Meteor.call('generateTestUser', (err, data) => {})

            return 'ok'
        })

        browser.pause(5000)

        browser.execute(() => Meteor.loginWithPassword('testing', 'testing'))

        browser.pause(5000)

        browser.url(`${baseUrl}`)

        browser.pause(10000)
    })

    it('should render correctly', () => {
        assert(browser.isExisting('#fileUploadValue-default'), true)
        assert(browser.isVisible('#fileUploadValue-default'), true)
    })

    it('should upload an image correctly', () => {
        const file = path.join(__dirname, '..', '..', '..', '..', 'public', 'img', 'dog.jpg')

        browser.chooseFile('#fileInput-default', file)
        browser.pause(10000)

        assert(browser.execute(() => $('#fileUploadValue-default').text() === 'Change').value, true)
        assert(browser.execute(() => Array.from($('#preview-default img').map((i, el) => $(el).attr('src'))).length > 0).value, true)
    })
})