const assert = require("assert");

const {waitForPageLoad, callMethod} = require('../../uiTestUtils');

describe('Search page', function() {
  afterEach(() => {
    callMethod(browser, 'deleteTestSocialResource', {});
  });

  it('should display a not found message', () => {
    browser.url('/search?q=nopenoway');
    waitForPageLoad(browser, '/search?q=nopenoway');

    assert.equal(browser.getText('.searchBar ~ p').trim(), 'Found 0 items');
    assert.equal(browser.getText('.searchBar ~ .card-columns').trim(), 'Sorry, we couldn\'t find anything.');
  });

  it('should find content with empty search term passed in query', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: "Test Name",
      description: "Test description",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });
    
    browser.url('/search?q=');
    waitForPageLoad(browser, '/search?q=');
    
    assert.equal(browser.getText('.searchBar ~ p').trim(), 'Found 1 items');
    const cards = browser.elements('.searchBar ~ .card-columns .card').value;
    assert.equal(cards.length, 1);
  });

  it('should find content with no search term passed in query', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: "Test Name",
      description: "Test description",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });
    
    browser.url('/search');
    waitForPageLoad(browser, '/search');
    
    assert.equal(browser.getText('.searchBar ~ p').trim(), 'Found 1 items');
    const cards = browser.elements('.searchBar ~ .card-columns .card').value;
    assert.equal(cards.length, 1);
  });

  it('should have the searchTerm from the global search box in the searchbox', () => {
    browser.url('/search?q=testquery');
    waitForPageLoad(browser, '/search?q=testquery');

    assert.equal(browser.getValue('.searchBar #searchBox'),'testquery');
  });

  it('should have the searchTerm from the global search box in the searchbox', () => {
    browser.url('/');
    waitForPageLoad(browser, '/');

    browser.setValue('.searchHeader', 'testquery');
    browser.submitForm('.searchHeader');
    
    waitForPageLoad(browser, '/search?q=testquery');
    assert.equal(browser.getValue('.searchBar #searchBox'),'testquery');
  });
  
  it('should find content with a matching search term', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: "Test Name",
      description: "Test description",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });
    
    browser.url('/search?q=Test Name');
    waitForPageLoad(browser, '/search?q=Test%20Name');
    
    assert.equal(browser.getText('.searchBar ~ p').trim(), 'Found 1 items');
    const cards = browser.elements('.searchBar ~ .card-columns .card').value;
    assert.equal(cards.length, 1);
  });
  
  it('should find content with a matching search term', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: "Test Name",
      description: "Test description",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });
    
    browser.url('/search?q=Test Name');
    waitForPageLoad(browser, '/search?q=Test%20Name');
    
    assert.equal(browser.getText('.searchBar ~ p').trim(), 'Found 1 items');
    const cards = browser.elements('.searchBar ~ .card-columns .card').value;
    assert.equal(cards.length, 1);
  });

  it('should filter content as the user is updated the search term', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: "Test Name",
      description: "Test description",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });
    
    browser.url('/search?q=');
    waitForPageLoad(browser, '/search?q=');
    
    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 1 items');
    
    browser.setValue('#searchBox', 'nope no way');
    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 0 items');

    browser.setValue('#searchBox', 'Test');
    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 1 items');
  });

  it('should properly set filter based on the queryparam', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: "Test Name",
      description: "Test description ",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });

    browser.url('/search?q=&type=events-learn-projects-research-warnings');
    waitForPageLoad(browser, '/search?q=&type=events-learn-projects-research-warnings');

    assert.equal(browser.isSelected('#eventsCheckbox'), true);
    assert.equal(browser.isSelected('#learnCheckbox'), true);
    assert.equal(browser.isSelected('#projectCheckbox'), true);
    assert.equal(browser.isSelected('#researchCheckbox'), true);
    assert.equal(browser.isSelected('#scamsCheckbox'), true);
    assert.equal(browser.isSelected('#communityCheckbox'), false);
    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 0 items');
  });
  
  it('should filter items based on the content type checkboxes', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: "Test Name",
      description: "Test description",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });
    
    browser.url('/search?q=');
    waitForPageLoad(browser, '/search?q=');
    
    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 1 items');

    browser.click('#communityCheckbox');
    waitForPageLoad(browser, '/search?q=&type=events-learn-projects-research-warnings');

    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 0 items');
  });
  
  it('should filter items based on the content type filtes in query', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: "Test Name",
      description: "Test description ",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });
    
    browser.url('/search?q=');
    waitForPageLoad(browser, '/search?q=');
    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 1 items');
    
    browser.url('/search?q=&type=events-learn-projects-research-warnings');
    waitForPageLoad(browser, '/search?q=&type=events-learn-projects-research-warnings');
    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 0 items');
  });

  it('should order items properly', () => {
    browser.url('/search?q=');
    waitForPageLoad(browser, '/search?q=');

    callMethod(browser, 'addTestSocialResource',{
      Name: "Test Name for old item",
      description: "Test description for old",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      createdAt: (new Date().getTime()) - 3600,
      tags: [{ name: "testTag" }],
    });
    callMethod(browser, 'addTestSocialResource',{
      Name: "Test Name for new item",
      description: "Test description for new",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });

    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 2 items');
    // Order old -> new by default
    assert.equal(browser.getText('.card-columns .card + .card .card-title').toLowerCase(), 'test name for old item');

    browser.click('#sort-date');
    // Order new -> old after switching
    browser.waitUntil(() => browser.getText('.card-columns .card + .card .card-title').toLowerCase() === 'test name for new item');
  });

  it('clicking the search bar clear should redirect to /', () => {
    browser.url('/search');
    waitForPageLoad(browser, '/search');
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/');

    browser.url('/search?q=');
    waitForPageLoad(browser, '/search?q=');
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/');

    browser.url('/search?q=asdf');
    waitForPageLoad(browser, '/search?q=asdf');
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/');
    
    browser.url('/search?q=&type=events-learn-projects-research-warnings');
    waitForPageLoad(browser, '/search?q=&type=events-learn-projects-research-warnings');
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/');

    browser.url('/search?q=asdf&type=events-learn-projects-research-warnings');
    waitForPageLoad(browser, '/search?q=asdf&type=events-learn-projects-research-warnings');
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/');
  });

  it('should redirect to the page of the content type if only one is selected', () => {
    browser.url('/search?q=asdf&type=events');
    waitForPageLoad(browser, '/search?q=asdf&type=events');
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/events');

    browser.url('/search?q=asdf&type=learn');
    waitForPageLoad(browser, '/search?q=asdf&type=learn');
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/learn');
    
    browser.url('/search?q=asdf&type=projects');
    waitForPageLoad(browser, '/search?q=asdf&type=projects');
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/projects');
    
    browser.url('/search?q=asdf&type=research');
    waitForPageLoad(browser, '/search?q=asdf&type=research');
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/research');
    
    browser.url('/search?q=asdf&type=socialResources');
    waitForPageLoad(browser, '/search?q=asdf&type=socialResources');
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/community');
    
    browser.url('/search?q=asdf&type=warnings');
    waitForPageLoad(browser, '/search?q=asdf&type=warnings');
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/scams');
  });
});