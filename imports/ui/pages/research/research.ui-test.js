const assert = require('assert')
const path = require('path')

const { waitForPageLoad, callMethod, clickUntil } = require("../../uiTestUtils");

const baseUrl = 'http://localhost:3000'

describe('Research page', function () {
    before(() => {
        browser.url(`${baseUrl}/`);
        waitForPageLoad(browser, `/`);
    
        callMethod(browser, "generateTestUser");
    
        browser.executeAsync(done =>
          Meteor.loginWithPassword("testing", "testing", done)
        );
    })

    it('user can add a new research paper', () => {
        browser.url(`${baseUrl}/research`);
        waitForPageLoad(browser, '/research');

        browser.click('#new-research');
        waitForPageLoad(browser, '/research/new');

        browser.setValue('#headline', 'Headline Test');

        clickUntil(browser, '.new-research', () => browser.getText('#abstractError'));

        assert.equal(browser.getText('#abstractError').trim(), 'Abstract is required');

        browser.setValue('#abstract', 'Abstract Test');

        const file = path.join(__dirname, '..', '..', '..', '..', 'public', 'pdf', 'test.pdf');
        browser.chooseFile('#fileInput-default', file);

        browser.waitUntil(() => browser.getText('#fileUploadValue-default').trim() === 'Change')

        const hrefs = browser.elements('#preview-default a').value.map((el) => el.getAttribute('href'));
        assert.equal(hrefs.length, 1);

        clickUntil(browser, '.new-research', () => browser.getUrl().endsWith('/research'));
    })

    it("users can translate a research", () => {
        browser.url('/research/headline-test');
        waitForPageLoad(browser, '/research/headline-test');

        browser.scroll(".translate-link", -1000, -1000);
        browser.pause(10);

        const href = browser.getAttribute(".translate-link", "href");
        browser.click(".translate-link");
        waitForPageLoad(browser, href);

        browser.setValue("input#headline", "Headline Test SR");
        browser.setValue("#abstract", "Abstract Test SR");

        clickUntil(browser, '.new-research', () => browser.getUrl().endsWith('/research'));
    });

    it("users can view different translations of a research", () => {
        waitForPageLoad(browser, "/research");
        const card = browser
            .element('a[href="/research/headline-test"]')
            .$("..")
            .$("..");
        card.click(".flagItem > i");

        // Testing to see if this is actually in the list
        card.waitForEnabled('a[href="/research/headline-test-sr"]');
        card.click('a[href="/research/headline-test-sr"]');

        waitForPageLoad(browser, "/research/headline-test-sr");

        assert.equal(browser.getText("h1.card-title"), "Headline Test SR");
        assert.equal(browser.getText(".abstract"), "Abstract Test SR");

        browser.click(".flagItem > i");
        // Testing to see if this is actually in the list
        browser.waitForEnabled('a[href="/research/headline-test"]');
        browser.click('a[href="/research/headline-test"]');

        waitForPageLoad(browser, "/research/headline-test");
    });

    it('user can edit research he/she created', () => {
        browser.url('/research');
        waitForPageLoad(browser, '/research');
        
        browser.execute(() => $($('.fa-ellipsis-h').get(0)).trigger('click'))
        browser.pause(3000)

        browser.click('#js-edit')
        browser.pause(3000)

        browser.setValue('#headline', 'Headline Test 2')
        browser.pause(8000)
        
        clickUntil(browser, '.new-research', () => browser.getUrl().endsWith('/research'));

        assert(browser.execute(() => Array.from($('.card-title a')).some(i => $(i).text().trim() === 'Headline Test 2')).value, true)
    })

    it('user can read the research', () => {
        browser.execute(() => FlowRouter.go('/research/headline-test-1'))
        browser.pause(3000)

        assert(browser.execute(() => $('h1.card-title').text() === 'Headline Test 2').value, true)
        assert(browser.execute(() => $('.abstract').text().trim() === 'Abstract Test').value, true)
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

    it('user can remove research he/she created', () => {
        browser.url(`${baseUrl}/research`)
        browser.pause(5000)

        let count = browser.execute(() => $('.card').length).value

        // Remove original
        browser.execute(() => $($('.fa-ellipsis-h').get(0)).trigger('click'))
        browser.pause(3000)

        browser.click('#js-remove')
        browser.pause(2000)

        browser.click('.swal2-confirm')
        browser.pause(3000)

        // Remove translation
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