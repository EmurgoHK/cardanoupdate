const {assert} = require("chai");

const {waitForPageLoad, callMethod} = require('../../uiTestUtils');

describe('Search page', function() {
  before(() => {
    prefix = `test${new Date().getTime()}nr`;
  })
  afterEach(() => {
    callMethod(browser, 'deleteTestSocialResource', {});
  });
  let prefix;
  it('should display a not found message', () => {
    browser.url(`/search?q=${prefix}nopenoway`);
    waitForPageLoad(browser, `/search?q=${prefix}nopenoway`);

    assert.equal(browser.getText('.searchBar ~ p').trim(), 'Found 0 items');
    assert.equal(browser.getText('.searchBar ~ .card-columns').trim(), 'Sorry, we couldn\'t find anything.');
  });

  it('should find content with empty search term passed in query', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: prefix + "Test Name",
      description: "Test description",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });
    
    browser.url('/search?q=');
    waitForPageLoad(browser, '/search?q=');
    
    assert.notEqual(browser.getText('.searchBar ~ p').trim(), 'Found 0 items');
    const cards = browser.elements('.searchBar ~ .card-columns .card').value;
    assert.isAtLeast(cards.length, 1);
  });

  it('should find content with no search term passed in query', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: prefix + "Test Name",
      description: "Test description",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });
    
    browser.url('/search');
    waitForPageLoad(browser, '/search');
    
    assert.notEqual(browser.getText('.searchBar ~ p').trim(), 'Found 0 items');
    const cards = browser.elements('.searchBar ~ .card-columns .card').value;
    assert.isAtLeast(cards.length, 1);
  });

  it('should have the searchTerm from the global search box in the searchbox', () => {
    browser.url(`/search?q=${prefix}testquery`);
    waitForPageLoad(browser, `/search?q=${prefix}testquery`);

    assert.equal(browser.getValue('.searchBar #searchBox'),`${prefix}testquery`);
  });

  it('should have the searchTerm from the global search box in the searchbox', () => {
    browser.url('/');
    waitForPageLoad(browser, '/');

    browser.setValue('.searchHeader', `${prefix}testquery`);
    browser.submitForm('.searchHeader');
    
    waitForPageLoad(browser, `/search?q=${prefix}testquery`);
    assert.equal(browser.getValue('.searchBar #searchBox'),`${prefix}testquery`);
  });
  
  it('should find content with a matching search term', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: prefix + "Test Name",
      description: "Test description",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });
    
    browser.url(`/search?q=${prefix}Test Name`);
    waitForPageLoad(browser, `/search?q=${prefix}Test%20Name`);
    
    assert.equal(browser.getText('.searchBar ~ p').trim(), 'Found 1 items');
    const cards = browser.elements('.searchBar ~ .card-columns .card').value;
    assert.equal(cards.length, 1);
  });
  
  it('should find content with a matching search term', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: prefix + "Test Name",
      description: "Test description",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });
    
    browser.url(`/search?q=${prefix}Test Name`);
    waitForPageLoad(browser, `/search?q=${prefix}Test%20Name`);
    
    assert.equal(browser.getText('.searchBar ~ p').trim(), 'Found 1 items');
    const cards = browser.elements('.searchBar ~ .card-columns .card').value;
    assert.equal(cards.length, 1);
  });

  it('should filter content as the user is updated the search term', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: prefix + "Test Name",
      description: "Test description",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });
    
    browser.url(`/search?q=${prefix}`);
    waitForPageLoad(browser, `/search?q=${prefix}`);
    
    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 1 items');
    
    browser.setValue('#searchBox', `${prefix}nope no way`);
    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 0 items');

    browser.setValue('#searchBox', `${prefix}Test`);
    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 1 items');
  });

  it('should properly set filter based on the queryparam', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: prefix + "Test Name",
      description: "Test description ",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });

    browser.url(`/search?q=${prefix}&type=events-learn-projects-research-warnings`);
    waitForPageLoad(browser, `/search?q=${prefix}&type=events-learn-projects-research-warnings`);

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
      Name: prefix + "Test Name",
      description: "Test description",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });
    
    browser.url(`/search?q=${prefix}`);
    waitForPageLoad(browser, `/search?q=${prefix}`);
    
    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 1 items');

    browser.click('#communityCheckbox');
    waitForPageLoad(browser, `/search?q=${prefix}&type=events-learn-projects-research-warnings`);

    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 0 items');
  });
  
  it('should filter items based on the content type filters in query', () => {
    callMethod(browser, 'addTestSocialResource',{
      Name: prefix + "Test Name",
      description: "Test description ",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });
    
    browser.url(`/search?q=${prefix}`);
    waitForPageLoad(browser, `/search?q=${prefix}`);
    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 1 items');
    
    browser.url(`/search?q=${prefix}&type=events-learn-projects-research-warnings`);
    waitForPageLoad(browser, `/search?q=${prefix}&type=events-learn-projects-research-warnings`);
    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 0 items');
  });

  it('should order items properly', () => {
    browser.url(`/search?q=${prefix}`);
    waitForPageLoad(browser, `/search?q=${prefix}`);

    callMethod(browser, 'addTestSocialResource',{
      Name: prefix + "Test Name for old item",
      description: "Test description for old",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      createdAt: (new Date().getTime()) - 3600,
      tags: [{ name: "testTag" }],
    });
    callMethod(browser, 'addTestSocialResource',{
      Name: prefix + "Test Name for new item",
      description: "Test description for new",
      Resource_url: "https://twitter.com/hashtag/TestTwitterUrl",
      tags: [{ name: "testTag" }],
    });

    browser.waitUntil(() => browser.getText('.searchBar ~ p').trim() === 'Found 2 items');
    // Order old -> new by default
    assert.equal(browser.getText('.card-columns .card + .card .card-title').toLowerCase(), `${prefix}test name for old item`);

    browser.click('#sort-date');
    // Order new -> old after switching
    browser.waitUntil(() => browser.getText('.card-columns .card + .card .card-title').toLowerCase() === `${prefix}test name for new item`);
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

    browser.url(`/search?q=${prefix}asdf`);
    waitForPageLoad(browser, `/search?q=${prefix}asdf`);
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/');
    
    browser.url(`/search?q=${prefix}&type=events-learn-projects-research-warnings`);
    waitForPageLoad(browser, `/search?q=${prefix}&type=events-learn-projects-research-warnings`);
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/');

    browser.url(`/search?q=${prefix}asdf&type=events-learn-projects-research-warnings`);
    waitForPageLoad(browser, `/search?q=${prefix}asdf&type=events-learn-projects-research-warnings`);
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/');
  });

  it('should redirect to the page of the content type if only one is selected', () => {
    browser.url(`/search?q=${prefix}asdf&type=events`);
    waitForPageLoad(browser, `/search?q=${prefix}asdf&type=events`);
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/events');

    browser.url(`/search?q=${prefix}asdf&type=learn`);
    waitForPageLoad(browser, `/search?q=${prefix}asdf&type=learn`);
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/learn');
    
    browser.url(`/search?q=${prefix}asdf&type=projects`);
    waitForPageLoad(browser, `/search?q=${prefix}asdf&type=projects`);
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/projects');
    
    browser.url(`/search?q=${prefix}asdf&type=research`);
    waitForPageLoad(browser, `/search?q=${prefix}asdf&type=research`);
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/research');
    
    browser.url(`/search?q=${prefix}asdf&type=socialResources`);
    waitForPageLoad(browser, `/search?q=${prefix}asdf&type=socialResources`);
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/community');
    
    browser.url(`/search?q=${prefix}asdf&type=warnings`);
    waitForPageLoad(browser, `/search?q=${prefix}asdf&type=warnings`);
    browser.click('.search-bar-cross');
    waitForPageLoad(browser, '/scams');
  });
});