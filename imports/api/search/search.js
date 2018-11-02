import { Index, MongoDBEngine } from 'meteor/easy:search'
import { Projects } from '/imports/api/projects/projects'



// export const ProjectsIndex = new Index({
//   collection: Projects,
//   fields: ['headline','description'],
//     engine: new MongoDBEngine({})
// })

import { _ } from 'meteor/underscore';

export const ProjectsIndex = new Index({
  engine: new MongoDBEngine({
    sort: function () {
      return { createdAt: -1 };
    },
    selector: function (searchObject, options, aggregation) {
      let selector = this.defaultConfiguration().selector(searchObject, options, aggregation),
        categoryFilter = options.search.props.categoryFilter;

      if (_.isString(categoryFilter) && !_.isEmpty(categoryFilter)) {
        selector.category = categoryFilter;
      }

      return selector;
    }
  }),
  collection: Projects,
  fields: ['headline','description'],
  defaultSearchOptions: {
    limit: 8
  },
  permission: () => {
    //console.log(Meteor.userId());
    return true;
  }
});