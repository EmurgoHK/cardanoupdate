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

  if (result.value.err) throw result.err;

  return result.value.res;
}

function waitForPageLoad(browser, url) {
  browser.waitUntil(() => browser.getUrl() === baseUrl + url);
  browser.executeAsync(done => FlowRouter.subsReady(done));
  browser.executeAsync(done => Tracker.afterFlush(done));
  browser.pause(500); // TODO: figure out a method to wait for event subscriptions/dataloading to finish
}

module.exports = {
  callMethod,
  waitForPageLoad,
}