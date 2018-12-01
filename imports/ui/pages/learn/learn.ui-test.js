const assert = require('assert')

const { waitForPageLoad, callMethod, clickUntil } = require("../../uiTestUtils");

const baseUrl = 'http://localhost:3000'

describe('Learn page', function () {
    before(() => {
        browser.url(`${baseUrl}/`);
        waitForPageLoad(browser, `/`);
    
        callMethod(browser, "generateTestUser");
    
        browser.executeAsync(done =>
          Meteor.loginWithPassword("testing", "testing", done)
        );
    });

    it('user can add a new learning item', function () {
        browser.url(`${baseUrl}/learn`)
        waitForPageLoad(browser, '/learn');

        browser.click('#new-learn')
        waitForPageLoad(browser, '/learn/new');

        browser.setValue('#title', 'Title test')
        browser.setValue('#summary', 'Summary test')
        browser.click('input[name="difficultyLevel"]')
        
        clickUntil(browser, '.new-learn', () => browser.getText('#contentError'));

        assert(browser.execute(() => $('#contentError').text().trim() === 'Content is required').value, true)

        browser.execute(() => { window.mde.value('Content test') })

        clickUntil(browser, '.new-learn', () => browser.getUrl().endsWith('/learn'));
    });

    it("users can translate a research", () => {
        browser.url('/learn/title-test');
        waitForPageLoad(browser, '/learn/title-test');

        browser.scroll(".translate-link", -1000, -1000);
        browser.pause(10);

        const href = browser.getAttribute(".translate-link", "href");
        browser.click(".translate-link");
        waitForPageLoad(browser, href);

        browser.setValue('#title', 'Title Test SR')
        browser.setValue('#summary', 'Summary Test SR')

        clickUntil(browser, '.new-learn', () => browser.getUrl().endsWith('/learn'));
    });

    it("users can view different translations of a research", () => {
        waitForPageLoad(browser, "/learn");
        const card = browser
            .element('a[href="/learn/title-test"]')
            .$("..")
            .$("..");
        card.click(".flagItem > i");

        // Testing to see if this is actually in the list
        card.waitForEnabled('a[href="/learn/title-test-sr"]');
        card.click('a[href="/learn/title-test-sr"]');

        waitForPageLoad(browser, "/learn/title-test-sr");

        assert.equal(browser.getText('h1.card-title'), 'Title Test SR');
        assert.equal(browser.getText('.summary').trim(), 'Summary Test SR');
        assert.equal(browser.getText('.content').trim(), 'Content test');

        browser.click(".flagItem > i");
        // Testing to see if this is actually in the list
        browser.waitForEnabled('a[href="/learn/title-test"]');
        browser.click('a[href="/learn/title-test"]');

        waitForPageLoad(browser, "/learn/title-test");
    });

    it('user can edit a learning resource he/she created', () => {
        browser.url('/learn');
        waitForPageLoad(browser, '/learn');

        browser.execute(() => $($('.fa-ellipsis-h').get(0)).trigger('click'))
        browser.pause(3000)

        browser.click('#js-edit')
        browser.pause(3000)

        browser.setValue('#title', 'Title test 2')
        browser.pause(1000)

        browser.setValue('#summary', 'Summary test 2')
        browser.pause(8000)

        browser.execute(() => window.grecaptcha.getResponse = () => '_test_captcha_')
        browser.pause(2000)

        browser.click('.new-learn')
        browser.pause(3000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'learn').value, true)

        assert(browser.execute(() => Array.from($('.card-title a')).some(i => $(i).text().trim() === 'Title test 2')).value, true)
    })

    it('user can read a learning resource', () => {
        browser.execute(() => FlowRouter.go('/learn/title-test-1'))
        browser.pause(3000)

        assert(browser.execute(() => $('h1.card-title').text() === 'Title test 2').value, true)
        assert(browser.execute(() => $('.content').text().trim() === 'Content test').value, true)
    })

    it('user can comment', () => {
        browser.setValue('textarea.comment-text', 'Test comment')
        browser.pause(2000)

        browser.click('.save-comment')
        browser.pause(3000)

        assert(browser.execute(() => Array.from($('.comments').find('.card-body span')).some(i => $(i).text().includes('Test comment'))).value, true)
    })

    it('user can reply to a comment', () => {
        browser.click('.reply')
        browser.pause(2000)

        browser.setValue(`.comments textarea.comment-text`, 'Test reply')
        browser.pause(1000)

        browser.click('.comments .save-comment')
        browser.pause(3000)

        assert(browser.execute(() => Array.from($('.comments').find('.card-body span')).some(i => $(i).text().includes('Test reply'))).value, true)
    })

    it('user can edit a comment', () => {
        browser.execute(() => $('.news-settings').find('.dropdown-menu').addClass('show'))
        browser.pause(3000)

        browser.click('.edit-mode')
        browser.pause(2000)

        browser.setValue(`.comments textarea.comment-text`, 'Test comment 2')
        browser.pause(1000)

        browser.click('.comments .save-comment')
        browser.pause(3000)

        assert(browser.execute(() => Array.from($('.comments').find('.card-body span')).some(i => $(i).text().includes('Test comment 2'))).value, true)
    })

    it('user can flag a comment', () => {
        browser.execute(() => $('.news-settings').find('.dropdown-menu').addClass('show'))
        browser.pause(3000)

        browser.click('.flag-comment')
        browser.pause(2000)

        browser.setValue('.swal2-input', 'Test flag')
        browser.pause(1000)

        browser.click('.swal2-confirm')
        browser.pause(3000)
    })

    it('user can remove a comment', () => {
        let count = browser.execute(() => $('.comments').find('.card').length).value

        browser.execute(() => $('.news-settings').find('.dropdown-menu').addClass('show'))
        browser.pause(3000)

        browser.click('.delete-comment')
        browser.pause(2000)

        browser.click('.swal2-confirm')
        browser.pause(2000)

        let countN = browser.execute(() => $('.comments').find('.card').length).value

        assert(count === countN + 1, true)
    })

    it('user can remove a learning resource he/she created', () => {
        browser.url(`${baseUrl}/learn`)
        browser.pause(5000)

        let count = browser.execute(() => $('.card').length).value

        // Removing original
        browser.execute(() => $($('.fa-ellipsis-h').get(0)).trigger('click'))
        browser.pause(3000)

        browser.click('#js-remove')
        browser.pause(2000)

        browser.click('.swal2-confirm')
        browser.pause(3000)

        // Removing translation
        browser.execute(() => $($('.fa-ellipsis-h').get(0)).trigger('click'))
        browser.pause(3000)

        browser.click('#js-remove')
        browser.pause(2000)

        browser.click('.swal2-confirm')
        browser.pause(3000)

        let countN = browser.execute(() => $('.card').length).value

        assert(count === countN + 1, true)
    })
})