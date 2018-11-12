# Meteor testing for EmurgoHK projects
On EmurgoHK projects, we mainly use two different types of testing, unit tests and acceptance tests. Unit tests are run on the server (*server-side tests*) and acceptance tests are executed on the client (*client-side tests*).

## Unit testing (*server-side tests*)
### Description
For unit testing, we're using Meteor's builtin testing utility with [Mocha driver](https://github.com/meteortesting/meteor-mocha). You can see basic documentation on the Mocha syntax [here](https://mochajs.org).

### Getting started
No previous installations are required to run server-side tests. So, to run unit tests, just use the following command:
```
meteor test --driver-package=meteortesting:mocha --once --port 5000
```

(*Please note that this command has to be run from the project directory*)

### File types
All JavaScript files in the root directory of the project with `.test.js` extension will be considered as unit tests and will be executed in the testing environment.

### Debugging
If you're debugging unit tests, it could be useful to remove the `--once` parameter, so tests are restarted on every file change.

### Example output
If everything goes correctly, when running the tests, you'll currently get something like this:
```
I20181111-21:35:02.055(1)?
I20181111-21:35:02.192(1)? --------------------------------
I20181111-21:35:02.194(1)? ----- RUNNING SERVER TESTS -----
I20181111-21:35:02.195(1)? --------------------------------
I20181111-21:35:02.196(1)?
I20181111-21:35:02.197(1)?
I20181111-21:35:02.199(1)?
I20181111-21:35:02.203(1)?   comments methods
    √ user can add a new comment (122ms)
    √ user can add a nested comment
...
    √ user can flag a warning
    √ moderator can remove a flagged project
I20181111-21:35:03.676(1)?
I20181111-21:35:03.678(1)?
I20181111-21:35:03.679(1)?   70 passing (2s)
I20181111-21:35:03.681(1)?
I20181111-21:35:03.682(1)? Load the app in a browser to run client tests, or set the TEST_BROWSER_DRIVER environment variable. See https://github.com/meteortesting/meteor-mocha/blob/master/README.md#run-app-tests
```

## Acceptance testing (*client-side tests*)
### Description
For acceptance testing, we're using [WebdriverIO](http://webdriver.io/) in combination with [Mocha](https://mochajs.org). In-depth overview of the WebdriverIO API is available [here](http://webdriver.io/api.html).

### Getting started
In order to successfully run WebdriverIO + Mocha tests locally, first you'll have to install some dependencies.

#### Installing selenium-standalone
```
npm install selenium-standalone@latest -g
```

```
selenium-standalone install
```

#### Installing WebdriverIO + Mocha
```
npm install -g wdio-mocha-framework webdriverio assert
```

#### Running WebdriverIO tests
Whenever you want to run WebdriverIO tests, you have to make sure that [Selenium](https://www.seleniumhq.org/) server is running.

You can start the Selenium server with:
```
selenium-standalone start &
```

After, you can run client-side tests with:
```
wdio wdio.conf.js 
```

(*Please note that this command has to be run from the project directory*)

### File types
All JavaScript files in the `/imports` directory with `.ui-test.js` extension will be considered as acceptance tests and will be executed in the testing environment.

### Debugging
- ERROR: unknown error: no chrome binary at /usr/bin/google-chrome-stable

If this error ocurrs, please update `wdio.conf.js` to use the correct path to `chrome` binary. 
Changing the path to `chrome` binary requires editing line 11 of `wdio.conf.js` (`binary: '/usr/bin/google-chrome-stable'`).
For example, to get it running on Windows, you'll probably have to change it to: 
`binary: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'`.
Please don't commit your modified `wdio.conf.js` as it'll break Travis CI build cycle.
If you don't have Chrome installed, you'll have to install it first. The latest version works correctly in headless mode without modifications.

- ERROR: Couldn't initialise framework "wdio-mocha-framework". Error: Missing binary. See message above.

WebdriverIO tests sometimes aren't working correctly with Node versions greater than 9.3.x and so this error ocurrs. You can fix it by installing nvm ([linux/osx](https://github.com/creationix/nvm), [windows](https://github.com/coreybutler/nvm-windows)) and installing Node version 9.3.0.

- All tests are failing

If you experience this error, please make sure that the Meteor instance is running, as WDIO doesn't report that the host is down, it just fails tests.

### Example output
If everything goes correctly, when running the tests, you'll currently get something like this:
```

...........................................................................

75 passing (208.00s)
```
Don't worry if tests are taking too long, we have some time-intensive tests already.
