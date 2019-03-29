import { cleanOrphanedFiles } from '../../cleanOrphanedFiles';
import { ResearchFiles, Research } from '../research';

SyncedCron.add({
  name: 'Clean orphaned files from ResearchFiles',
  schedule: (parser) => parser.cron('? 0 * * *'),
  job: () => cleanOrphanedFiles(ResearchFiles, [{ collection: Research, idFieldSelectors: [a => a.pdfId]}]),
});