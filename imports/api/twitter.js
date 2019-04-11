import { Config } from "./config/config";
import Twit from "twit";

let twit;
if (Meteor.isServer) {
  const twitterConf = Config.findOne({ _id: "twitter_token" });

  if (twitterConf) {
    twit = new Twit(twitterConf);
  }
}

export function tweet(status) {
  if (Meteor.isServer && twit) {
    twit.post("statuses/update", { status }, function(err, data, response) {
      if (err) {
        console.error(err);
      }
    });
  }
}
