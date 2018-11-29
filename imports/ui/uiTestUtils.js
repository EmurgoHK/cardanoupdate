const baseUrl = "http://localhost:3000";

function callMethod(browser, methodName, ...args) {
  const result = browser.executeAsync(
    (methodName, ...args) => {
      const done = args.pop();
      Meteor.call(methodName, ...args, (err, res) => done({ err, res }));
    },
    methodName,
    ...args
  );

  if (result.value.err) throw result.value.err;

  return result.value.res;
}

function waitForPageLoad(browser, url) {
  browser.waitUntil(() => browser.getUrl().endsWith(url));
  browser.executeAsync(done => FlowRouter.subsReady(done));
  browser.executeAsync(done => Tracker.afterFlush(done));
  browser.pause(500); // TODO: figure out a method to wait for event subscriptions/dataloading to finish
}

function clickUntil(browser, sel, fn, maxTries = 10) {
  if (!fn()) {
    browser.click(sel);

    try {
      browser.waitUntil(fn, 500)
    } catch(ex) {
      if (maxTries > 0)
        clickUntil(browser, sel, fn, maxTries - 1);
      else 
        throw ex;
    }
  }
}

module.exports = {
  callMethod,
  waitForPageLoad,
  clickUntil,
}