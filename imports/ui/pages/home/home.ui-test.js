const assert = require('assert')
const baseUrl = 'http://localhost:3000'

describe('Home page', function () {
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

    it('renders correctly', () => {
        let vals = []

        for (let i = 0; i < 3; i++) {
            vals[i] = browser.execute((i) => $($('.home-text-value').get(i)).text().trim(), i).value
        }

        // should display the correct value of online / registered users
        let first = vals[0].split('/')

        assert(Number(first[0].trim()) >= 1, true)
        assert(Number(first[1].trim()) >= 1, true)

        // should display the correct value of newly registered users
        assert(Number(vals[1].trim()) >= 0, true)

        // should display the correct value of new content
        assert(Number(vals[2].trim()) >= 0, true)
    })

    it('new button lets you add all content types', () => {
        browser.click('.add-new-content')
        browser.pause(2000)

        let types = browser.execute(() => Array.from($('.list-group-item')).filter(i => !!$(i).find('a').attr('href')).map(i => $(i).text().replace('New', '').trim())).value
        let allTypes = ['project', 'event', 'research', 'community', 'learning resource']

        assert.ok(types.join().toLowerCase() === allTypes.join().toLowerCase())

        browser.click('.close')
    })
})