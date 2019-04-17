import { Meteor } from "meteor/meteor";
import { onPageLoad } from "meteor/server-render";
import { Events } from "../../api/events/events";
import { Projects } from "../../api/projects/projects";
import { Research } from "../../api/research/research";
import { Learn } from "../../api/learn/learn";
import { socialResources } from "../../api/socialResources/socialResources";
import { Warnings } from "../../api/warnings/warnings";

const siteName = "Cardano Update Space";
const defaultImage = "https://cardanoupdate.space/img/logo.png";
const defaultDescription = "Everything about Cardano. Accurate up to the minute.";

function createMetaTag(property, content) {
  return `<meta property="${property}" content="${content}">`;
}

onPageLoad(sink => {
  const { pathname } = sink.request.url;
  const meteorHost = Meteor.absoluteUrl();
  let title, description, imageUrl;
  const [, contentType, slug] = /^\/(.+)\/(.+)/.exec(pathname) || [];

  switch (contentType) {
    case "projects":
      const project = Projects.findOne({ $or: [{ slug }, { _id: slug }] });
      if (project) {
        title = project.headline;
        description = project.description;
      }
      break;
    case "events":
      const event = Events.findOne({ $or: [{ slug }, { _id: slug }] });
      if (event) {
        title = `${event.headline} - ${event.start_date}`;
        description = event.description;
      }
      break;
    case "research":
      const research = Research.findOne({ $or: [{ slug }, { _id: slug }] });
      if (research) {
        title = research.headline;
        description = research.abstract;
      }
      break;
    case "learn":
      const learn = Learn.findOne({ $or: [{ slug }, { _id: slug }] });
      if (learn) {
        title = learn.title;
        description = learn.summary;
      }
      break;
    case "community":
      const community = socialResources.findOne({
        $or: [{ slug }, { _id: slug }]
      });
      if (community) {
        title = community.Name;
        description = community.description;
      }
      break;
    case "scams":
      const scam = Warnings.findOne({ $or: [{ slug }, { _id: slug }] });
      if (scam) {
        title = scam.headline;
        description = scam.summary;
      }
      break;
  }
  const fullUrl = meteorHost + pathname.replace(/^\/+/g, "");
  sink.appendToHead(createMetaTag("og:title", title || siteName));
  sink.appendToHead(createMetaTag("og:description", description || defaultDescription));
  sink.appendToHead(createMetaTag("og:image", imageUrl || defaultImage));
  sink.appendToHead(createMetaTag("og:site_name", siteName));
  sink.appendToHead(createMetaTag("og:url", fullUrl));
  sink.appendToHead(createMetaTag("twitter:card", "summary"));
});
