const assert = require('assert')

const { waitForPageLoad, callMethod, clickUntil } = require('../../uiTestUtils')

const baseUrl = 'http://localhost:3000'

describe('Translations page', function () {
    before(() => {
        browser.url(`${baseUrl}/`)
        waitForPageLoad(browser, `/`)
    
        callMethod(browser, 'generateTestUser')
    
        browser.executeAsync(done =>
            Meteor.loginWithPassword('testing', 'testing', done)
        )
    })

    it('user can use the translation utility', function () {
        browser.url(`${baseUrl}/translations`)
        waitForPageLoad(browser, '/translations')

        browser.selectByValue('.view-scope', 'breadcrumbs')
        browser.waitUntil(() => browser.execute(() => $('.view-scope').val()).value !== null, 5000)

        browser.selectByValue('.language', 'ru')
        browser.waitUntil(() => browser.execute(() => $('.language').val()).value !== null, 5000)

        browser.waitUntil(() => browser.execute(() => $('thead').text().trim().split(/ {2,}/)[1]).value === 'Русский язык', 5000)

        browser.waitForVisible('#breadcrumbs\\.faq')

        browser.setValue('#breadcrumbs\\.faq', 'Часто задаваемые вопросы (ЧЗВ)')

        browser.click('.save-data')

        browser.waitUntil(() => browser.execute(() => $('.swal2-title').text()).value === 'Successfully saved.', 5000)
    })
})