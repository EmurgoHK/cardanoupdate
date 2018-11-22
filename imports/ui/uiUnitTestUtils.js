import { _ } from 'meteor/underscore';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Tracker } from 'meteor/tracker';

async function withDiv(callback) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  try {
    return await callback(el);
  } finally {
    document.body.removeChild(el);
  }
};

export function withRenderedTemplate(template, data, callback) {
  return withDiv(async (el) => {
    const ourTemplate = _.isString(template) ? Template[template] : template;
    Template.registerHelper('_', key => key);

    Blaze.renderWithData(ourTemplate, data, el);
    const tplInst = Blaze.getView($(el).children()[0]).templateInstance();
    Tracker.flush();
    await new Promise(res => tplInst.autorun(() => {if (tplInst.subscriptionsReady()) res();}));

    return await callback(el);
  });
};

export function promiseCall(method, ...args) {
  return new Promise((res, rej) => 
    Meteor.call(method, ...args, (err, data) => {
      if (err) rej(err); 
      else res(data);
    })
  );
}

export async function waitUntil(fn) {
  const r = fn(); // Try;
  if (r && (r.length === undefined || r.length > 0)) // If we have r and it's not an empty array we are done
    return r;
  // Sleep 100ms;
  await new Promise(res => setInterval(res, 100));
  // Recurse
  return await waitUntil(fn); 
}

export class CallbackTester {
  constructor() {
    this.res = undefined;

    this.promise = undefined;
  }

  expect() {
    this.promise = new Promise(res => this.res = res);
  }

  getCallback() {
    return () => ((data) => this.res(data));
  }
}