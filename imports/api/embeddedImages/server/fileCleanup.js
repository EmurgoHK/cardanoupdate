import { cleanOrphanedFiles } from '../../cleanOrphanedFiles';
import { EmbeddedImages } from '../embeddedImages';
import { Events } from '../../events/events';
import { Learn } from '../../learn/learn';

SyncedCron.add({
  name: 'Clean orphaned files embedded in text',
  schedule: (parser) => parser.cron('? 0 * * *'),
  job: () => cleanOrphanedFiles(EmbeddedImages, [
    { collection: Events, linkFieldSelectors: [a => a.description]},
    { collection: Learn, linkFieldSelectors: [a => a.content]},
  ]),
});