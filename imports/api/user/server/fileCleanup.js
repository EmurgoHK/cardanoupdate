import { cleanOrphanedFiles } from '../../cleanOrphanedFiles';
import { ProfileImages } from '../profileImages';

SyncedCron.add({
  name: 'Clean orphaned files from ProfileImages',
  schedule: (parser) => parser.cron('? 0 * * *'),
  job: () => cleanOrphanedFiles(ProfileImages, [{collection: Meteor.users, idFieldSelectors: [(a) => a.profile.imageId]}]),
});