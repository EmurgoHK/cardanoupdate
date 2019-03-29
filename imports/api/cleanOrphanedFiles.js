import { existsSync, statSync } from "fs-extra";

export function cleanOrphanedFiles(fileCollection, collections) {
  const usedIds = new Set();

  for (const {collection, idFieldSelectors, linkFieldSelectors} of collections) {
    const docs = collection.find({}).fetch();

    if (idFieldSelectors && idFieldSelectors.length > 0) {
      for (const fieldSelector of idFieldSelectors) {
        for (const id of docs.map(fieldSelector).filter(a => !!a)) {
          usedIds.add(id);
        }
      }
    }

    if (linkFieldSelectors && linkFieldSelectors.length > 0) {
      const files = fileCollection.find().map(a => ({id: a._id, link: fileCollection.link(a)}));

      for (const linkFieldSelector of linkFieldSelectors) {
        const fieldValues = docs.map(linkFieldSelector).filter(a => !!a);
        for (const file of files) {
          if (fieldValues.some(v => v.includes(file.link)))
            usedIds.add(file.id);
        }
      }
    }
  }

  const orphanedFiles = fileCollection.find({_id: {$not: {$in: Array.from(usedIds)}}}).fetch();
  const removedFileIds = orphanedFiles.filter((f) => {
    return !existsSync(f.path) ||                                               // already deleted from the disk
           new Date(statSync(f.path).mtime) < new Date(Date.now() - 604800000); // older than one week
  }).map(f => f._id);

  if (removedFileIds.length === 0) {
    console.log(`No orphaned files in ${fileCollection.collectionName}`)
  } else {
    console.log(`Dropping old files: ${removedFileIds.join(', ')} from ${fileCollection.collectionName}`);
    fileCollection.remove({_id: {$in: removedFileIds}}, (err, n) => {
      if (err) {
        console.log('File cleanup failed: ', err);
      } else {
        console.log(`Removed ${n} files.`);
      }
    });
  }
}