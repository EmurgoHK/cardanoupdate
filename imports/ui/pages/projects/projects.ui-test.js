const assert = require('assert')

const { waitForPageLoad, callMethod, clickUntil } = require("../../uiTestUtils");

const baseUrl = 'http://localhost:3000'

describe('Projects page', function () {
    before(() => {
        browser.url(`${baseUrl}/`);
        waitForPageLoad(browser, `/`);
    
        callMethod(browser, "generateTestUser");
    
        browser.executeAsync(done =>
          Meteor.loginWithPassword("testing", "testing", done)
        );
    });

    it('user can add a new project', function () {
        browser.url(`${baseUrl}/projects`)
        waitForPageLoad(browser, '/projects');

        browser.click('#add-project')
        waitForPageLoad(browser, '/projects/new');

        browser.waitForEnabled('#projectInstruction .btn-secondary');
        browser.click('.btn-secondary')
        browser.waitUntil(() => !browser.isVisible('#projectInstruction'));

        browser.setValue('#headline', 'Headline Test')

        clickUntil(browser, '.add-project', () => browser.getText('#descriptionError'));

        assert(browser.execute(() => $('#descriptionError').text().trim() === 'Description is required').value, true)

        browser.setValue('#description', 'Description Test')

        browser.setValue('#github_url', 'https://github.com/anbud')

        browser.click('input[name="type"]')

        clickUntil(browser, '.add-project', () => browser.getUrl().endsWith('/projects'));
    })

    it("users can translate a research", () => {
        browser.url('/projects/headline-test');
        waitForPageLoad(browser, '/projects/headline-test');

        browser.scroll(".translate-link", -1000, -1000);
        browser.pause(10);

        const href = browser.getAttribute(".translate-link", "href");
        browser.click(".translate-link");
        waitForPageLoad(browser, href);

        browser.setValue('#headline', 'Headline Test SR')
        browser.setValue('#description', 'Description Test SR')
        browser.setValue('#github_url', 'https://github.com/anbud')

        clickUntil(browser, '.add-project', () => browser.getUrl().endsWith('/projects'));
    });

    it("users can view different translations of a research", () => {
        waitForPageLoad(browser, "/projects");
        const card = browser
            .element('a[href="/projects/headline-test"]')
            .$("..")
            .$("..");
        card.click(".flagItem > i");

        // Testing to see if this is actually in the list
        card.waitForEnabled('a[href="/projects/headline-test-sr"]');
        card.click('a[href="/projects/headline-test-sr"]');

        waitForPageLoad(browser, "/projects/headline-test-sr");

        assert.equal(browser.getText('h1.card-title'), 'Headline Test SR');
        assert.equal(browser.getText('.news-body').trim(), 'Description Test SR');

        browser.click(".flagItem > i");
        // Testing to see if this is actually in the list
        browser.waitForEnabled('a[href="/projects/headline-test"]');
        browser.click('a[href="/projects/headline-test"]');

        waitForPageLoad(browser, "/projects/headline-test");
    });

    it('user can propose new data if data is missing', () => {
        browser.url('/projects');
        waitForPageLoad(browser, '/projects');

        browser.click('.website')
        browser.pause(3000)

        browser.setValue('.swal2-input', 'https://testing.com')
        browser.pause(1000)

        browser.click('.swal2-confirm')
        browser.pause(2000)

        assert(browser.execute(() => !!testingProjects.findOne({ 'edits.0': { $exists: true } })).value, true)
    })

    it('user can edit a project he/she created', () => {
        browser.execute(() => $($('.fa-ellipsis-h').get(0)).trigger('click'))
        browser.pause(3000)

        browser.click('#js-edit')
        browser.pause(3000)

        browser.setValue('#headline', 'Headline Test 2')
        browser.pause(8000)

        browser.execute(() => window.grecaptcha.getResponse = () => '_test_captcha_')
        browser.pause(2000)

        browser.click('.add-project')
        browser.pause(3000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'projects').value, true)

        assert(browser.execute(() => Array.from($('.card-title a')).some(i => $(i).text().trim() === 'Headline Test 2')).value, true)
    })

    it('user can see project info', () => {
        browser.execute(() => FlowRouter.go('/projects/headline-test-1'))
        browser.pause(3000)

        assert(browser.execute(() => $('h1.card-title').text() === 'Headline Test 2').value, true)
        assert(browser.execute(() => $('.news-body').text().trim() === 'Description Test').value, true)
    })

    it('user can post cool stuff', () => {
        browser.setValue('.cool-stuff textarea.comment-text', 'Test comment')
        browser.pause(2000)

        browser.click('.cool-stuff .save-comment')
        browser.pause(3000)

        assert(browser.execute(() => Array.from($('.comments').find('.card-body span')).some(i => $(i).text().includes('Test comment'))).value, true)
    })

    it('user can reply to a comment', () => {
        browser.click('.cool-stuff .reply')
        browser.pause(2000)

        browser.setValue(`.cool-stuff .comments textarea.comment-text`, 'Test reply')
        browser.pause(1000)

        browser.click('.cool-stuff .comments .save-comment')
        browser.pause(3000)

        assert(browser.execute(() => Array.from($('.comments').find('.card-body span')).some(i => $(i).text().includes('Test reply'))).value, true)
    })

    it('user can edit a comment', () => {
        browser.execute(() => $('.news-settings').find('.dropdown-menu').addClass('show'))
        browser.pause(3000)

        browser.click('.cool-stuff .edit-mode')
        browser.pause(2000)

        browser.setValue(`.cool-stuff .comments textarea.comment-text`, 'Test comment 2')
        browser.pause(1000)

        browser.click('.cool-stuff .comments .save-comment')
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

    it('user can remove a project he/she created', () => {
        browser.url(`${baseUrl}/projects`)
        browser.pause(5000)

        let count = browser.execute(() => $('.card').length).value

        // Removing original 
        browser.execute(() => $($('.fa-ellipsis-h').get(0)).trigger('click'))
        browser.pause(1000)

        browser.click('#js-remove')
        browser.pause(2000)

        browser.click('.swal2-confirm')
        browser.pause(3000)

        // Removing translation 
        browser.execute(() => $($('.fa-ellipsis-h').get(0)).trigger('click'))
        browser.pause(1000)

        browser.click('#js-remove')
        browser.pause(2000)

        browser.click('.swal2-confirm')
        browser.pause(3000)
        let countN = browser.execute(() => $('.card').length).value

        assert(count === countN + 1, true)
    })
})