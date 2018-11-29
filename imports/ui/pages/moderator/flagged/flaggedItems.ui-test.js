const assert = require('assert')

const { waitForPageLoad, callMethod, clickUntil } = require("../../../uiTestUtils");

const baseUrl = 'http://localhost:3000'

describe('Flagged items page', function () {
    before(() => {
        browser.url(`${baseUrl}/`);
        waitForPageLoad(browser, `/`);
    
        callMethod(browser, "generateTestUser");
        callMethod(browser, "generateTestFlaggedProject");
    
        browser.executeAsync(done =>
          Meteor.loginWithPassword("testing", "testing", done)
        );
    });

    it('moderator can see flagged items', function () {
        browser.url(`${baseUrl}/moderator/flagged`)
        browser.pause(5000)

        assert(browser.execute(() => $('.card').length > 0).value, true)
    })

    it('moderator can ignore flagged items', function () {
        let count = browser.execute(() => $('.card').length).value

        browser.click('#js-ignore')
        browser.pause(3000)

        // confirm swal dialog
        clickUntil(browser, '.swal2-confirm', () => browser.isVisible('.swal2-container'));

        let countN = browser.execute(() => $('.card').length).value

        assert(count <= countN + 1, true)
    })
    
    it('moderator can remove flagged items', function () {
        let count = browser.execute(() => $('.card').length).value

        browser.click('#js-remove')
        browser.pause(3000)

        // confirm swal dialog
        browser.execute(() => $('.swal2-confirm').click())
        browser.pause(3000)

        let countN = browser.execute(() => $('.card').length).value

        assert(count <= countN + 1, true)
    })

    after(() => {
        browser.execute(() => {
            Meteor.call('removeTestFlagged', (err, data) => {})

            return 'ok'
        })

        browser.pause(5000)
    })
})