const assert = require("assert");
const baseUrl = "http://localhost:3000";
const { waitForPageLoad, callMethod } = require("../../uiTestUtils");

describe.only("Warnings page", function() {
  before(() => {
    browser.url(`${baseUrl}/`);
    waitForPageLoad(browser, `/`);

    callMethod(browser, "generateTestUser");

    browser.executeAsync(done =>
      Meteor.loginWithPassword("testing", "testing", done)
    );
  });

  it("user can add a new warning", function() {
    browser.url(`${baseUrl}/scams`);
    waitForPageLoad(browser, "/scams");

    browser.waitForEnabled("#add-warning");
    browser.click("#add-warning");

    waitForPageLoad(browser, "/scams/new");
    browser.waitForEnabled(".add-warning");
    browser.click(".add-warning");

    browser.waitForText("#headlineError");
    assert.equal(browser.getText("#headlineError"), "Headline is required");
    browser.waitForText("#summaryError");
    assert.equal(browser.getText("#summaryError"), "Description is required");

    browser.setValue("input#headline", "Headline Test");
    browser.waitUntil(
      () => browser.getText("#headlineError") !== "Headline is required"
    );
    browser.setValue("textarea#description", "Description Test");
    browser.waitForEnabled(".add-warning");
    browser.click(".add-warning");
    browser.click(".add-warning"); // TODO: figure out why do we need to call this twice
    waitForPageLoad(browser, "/scams");
  });

  it("user can see warning info", () => {
    browser.url("/scams/headline-test");
    waitForPageLoad(browser, "/scams/headline-test");

    browser.waitForText("h1.card-title");
    assert.equal(browser.getText("h1.card-title"), "Headline Test");
    assert.equal(browser.getText(".news-body"), "Description Test");
  });

  it("user can comment", () => {
    browser.waitForEnabled("textarea.comment-text");
    browser.setValue("textarea.comment-text", "Test comment");

    browser.waitForEnabled(".save-comment");
    browser.click(".save-comment");

    browser.waitUntil(() =>
      browser
        .elements(".comments .card-body span")
        .value.some(i => i.getText().includes("Test comment"))
    );
  });

  it("user can reply to a comment", () => {
    browser.click(".reply");

    browser.waitForExist(`.comments textarea.comment-text`);
    browser.setValue(`.comments textarea.comment-text`, "Test reply");

    browser.click(".comments .save-comment");

    browser.waitUntil(() =>
      browser
        .elements(".comments .card-body span")
        .value.some(i => i.getText().includes("Test reply"))
    );
  });

  it("user can edit a comment", () => {
    browser.execute(() =>
      $(".news-settings")
        .find(".dropdown-menu")
        .addClass("show")
    );
    browser.waitForEnabled(".edit-mode");

    browser.click(".edit-mode");

    browser.waitForExist(".comments textarea.comment-text");
    browser.setValue(`.comments textarea.comment-text`, "Test comment 2");
    browser.click(".comments .save-comment");

    browser.waitUntil(() =>
      browser
        .elements(".comments .card-body span")
        .value.some(i => i.getText().includes("Test comment 2"))
    );
  });

  it("user can flag a comment", () => {
    browser.click(".comment.card .icon-settings.dropdown-toggle");
    browser.waitForEnabled(".comment.card .flag-comment");
    browser.click(".comment.card .flag-comment");

    browser.waitForVisible(".swal2-input");
    browser.setValue(".swal2-input", "Test flag");
    browser.click(".swal2-confirm");
    browser.waitUntil(
      () => !browser.isVisible(".swal2-container"),
      "swal did not go away"
    );
  });

  it("user can remove a comment", () => {
    let count = browser.execute(() => $(".comments").find(".card").length)
      .value;
    browser.execute(() =>
      $(".news-settings")
        .find(".dropdown-menu")
        .addClass("show")
    );
    browser.click(".delete-comment");
    browser.waitForEnabled(".swal2-confirm");
    browser.click(".swal2-confirm");
    browser.waitUntil(
      () => browser.elements(".comments .card").value.length === count - 1
    );
  });

  it("users can translate warnings", () => {
    browser.scroll(".translate-link", -1000, -1000);
    browser.pause(500);

    const href = browser.getAttribute(".translate-link", "href");
    browser.click(".translate-link");
    waitForPageLoad(browser, href);

    browser.setValue("input#headline", "Headline Test SR");
    browser.setValue("textarea#description", "Description Test SR");

    browser.click(".add-warning");
    browser.click(".add-warning");
    waitForPageLoad(browser, "/scams");
  });

  it("users can view different translations of a warning", () => {
    const card = browser
      .element('a[href="/scams/headline-test"]')
      .$("..")
      .$("..");
    card.click(".flagItem > i");

    // Testing to see if this is actually in the list
    card.waitForEnabled('a[href="/scams/headline-test-sr"]');
    card.click('a[href="/scams/headline-test-sr"]');

    waitForPageLoad(browser, "/scams/headline-test-sr");

    assert.equal(browser.getText("h1.card-title"), "Headline Test SR");
    assert.equal(browser.getText(".news-body"), "Description Test SR");

    browser.click(".flagItem > i");
    // Testing to see if this is actually in the list
    browser.waitForEnabled('a[href="/scams/headline-test"]');
    browser.click('a[href="/scams/headline-test"]');

    waitForPageLoad(browser, "/scams/headline-test");
  });

  it("user can edit a warning he/she created", () => {
    browser.url(`${baseUrl}/scams`);
    waitForPageLoad(browser, "/scams");

    browser.element(".flagItem > i").click();
    const href = browser.element("#js-edit").getAttribute("href");
    assert(href.includes("/scams/"));
    browser.click("#js-edit");

    waitForPageLoad(browser, href);
    browser.setValue("#headline", "Headline Test 2");
    browser.click(".add-warning");
    waitForPageLoad(browser, "/scams");

    browser.waitUntil(() =>
      browser
        .elements(".card-title a")
        .value.some(i => i.getText().trim() === "Headline Test 2")
    );
  });

  it("user can remove a warning he/she created", () => {
    browser.url(`${baseUrl}/scams`);
    waitForPageLoad(browser, "/scams");

    let count = browser.execute(() => $(".card").length).value;
    browser.element(".flagItem > i").click();

    browser.waitForEnabled("#js-remove");
    browser.click("#js-remove");

    browser.waitUntil(() => browser.isVisible(".swal2-container"));
    browser.waitForEnabled(".swal2-confirm");
    browser.click(".swal2-confirm");

    browser.waitUntil(() => !browser.isVisible(".swal2-container"));

    browser.element(".flagItem > i").click();

    browser.waitForEnabled("#js-remove");
    browser.click("#js-remove");

    browser.waitUntil(() => browser.isVisible(".swal2-container"));
    browser.waitForEnabled(".swal2-confirm");
    browser.click(".swal2-confirm");

    browser.waitUntil(
      () => browser.elements(".card").value.length === count - 1
    );
  });
});
