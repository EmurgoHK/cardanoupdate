import { Meteor } from "meteor/meteor";
import { updateResourceUrlTypes } from "../methods";

Meteor.startup(() => {
  SyncedCron.add({
    name: "Updating social resource types",
    schedule: parser => parser.cron("0 * * * *"), // every hour will be sufficient
    job: () => updateResourceUrlTypes.call({}, (err, data) => {})
  });
});
