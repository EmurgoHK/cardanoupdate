const assert = require('assert')

const { waitForPageLoad, callMethod, clickUntil } = require("../../uiTestUtils");

const baseUrl = 'http://localhost:3000'

describe('Events page', function () {
    before(() => {
        browser.url(`${baseUrl}/`);
        waitForPageLoad(browser, `/`);
    
        callMethod(browser, "generateTestUser");
    
        browser.executeAsync(done =>
          Meteor.loginWithPassword("testing", "testing", done)
        );
    });

    it('user can add a new event', function () {
        browser.url(`${baseUrl}/events`);
        waitForPageLoad(browser, '/events');

        browser.click('#add-event');
        waitForPageLoad(browser, '/events/new');

        browser.setValue('#headline', 'Headline Test');
        browser.click('.add-event');

        clickUntil(browser, '.add-event', () => browser.getText('#descriptionError'));
        assert.equal(browser.getText('#descriptionError').trim(), 'Description is required');

        browser.execute(() => { window.mde.value('Description Test') });
        browser.setValue('#location', 'Novi Sad, S');
        
        browser.waitForEnabled('.pac-item');
        browser.click('.pac-item');
        browser.setValue('#rsvp', 'test');
        
        clickUntil(browser, '.add-event', () => browser.getUrl().endsWith('/events'));
    });

    it("users can translate an event", () => {
        browser.url('/events/headline-test');
        waitForPageLoad(browser, '/events/headline-test');

        browser.scroll(".translate-link", -1000, -1000);
        browser.pause(10);

        const href = browser.getAttribute(".translate-link", "href");
        browser.click(".translate-link");
        waitForPageLoad(browser, href);

        browser.setValue('#headline', 'Headline Test SR')

        clickUntil(browser, '.add-event', () => browser.getUrl().endsWith('/events'));
    });

    it("users can view different translations of an event", () => {
        waitForPageLoad(browser, "/events");
        const card = browser
            .element('a[href="/events/headline-test"]')
            .$("..")
            .$("..");
        card.click(".flagItem > i");

        // Testing to see if this is actually in the list
        card.waitForEnabled('a[href="/events/headline-test-sr"]');
        card.click('a[href="/events/headline-test-sr"]');

        waitForPageLoad(browser, "/events/headline-test-sr");

        assert.equal(browser.getText('h1.card-title'), 'Headline Test SR');

        browser.click(".flagItem > i");
        // Testing to see if this is actually in the list
        browser.waitForEnabled('a[href="/events/headline-test"]');
        browser.click('a[href="/events/headline-test"]');

        waitForPageLoad(browser, "/events/headline-test");
    });

    it('user can edit a event he/she created', () => {
        browser.url('/events');
        waitForPageLoad(browser, '/events');

        browser.execute(() => $($('.fa-ellipsis-h').get(0)).trigger('click'))
        browser.pause(3000)

        browser.click('#js-edit')
        browser.pause(3000)

        browser.setValue('#headline', 'Headline Test 2')
        browser.pause(1000)

        browser.execute(() => window.grecaptcha.getResponse = () => '_test_captcha_')
        browser.pause(2000)
        
        browser.click('.add-event')
        browser.pause(3000)

        assert(browser.execute(() => FlowRouter.current().route.name === 'events').value, true)

        assert(browser.execute(() => Array.from($('.card-title a')).some(i => $(i).text().trim() === 'Headline Test 2')).value, true)
    })

    it('user can see event info', () => {
        browser.execute(() => FlowRouter.go('/events/headline-test-1'))
        browser.pause(3000)

        assert(browser.execute(() => $('h1.card-title').text() === 'Headline Test 2').value, true)
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

    it('user can remove a event he/she created', () => {
        browser.url(`${baseUrl}/events`)
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