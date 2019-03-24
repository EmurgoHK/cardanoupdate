import { Meteor } from 'meteor/meteor'

import { Research, ResearchFiles } from '../research'

Meteor.publish('research', () => Research.find({}, {
	sort: {
		createdAt: -1
	}
}));

publishComposite('research.item', (id) => ({
	find() {
		if (!id)
			return undefined;
		// Find top ten highest scoring posts
		return Research.find({
			$or: [{
				_id: id
			}, {
				slug: id
			}]
		}, {
			sort: {
				createdAt: -1
			}
		});
	},
	children: [
		{
			find(research) { // Find the attached files
				if (!research.pdfId)
					return undefined;

				return ResearchFiles.find({
					_id: research.pdfId
				}).cursor;
			}
		},
	]
}));

Meteor.publish('research.search', (q) => Research.find(        {
		$or: [{
			headline: {
				$regex: new RegExp(q, "i")
			}
		}, {
			abstract: {
				$regex: new RegExp(q, "i")
			}
		}
		]
	}, {
		sort: {
			createdAt: -1
		}
	})
)

Meteor.publish('research.flagged', () => {
	return Research.find({
		'flags.0': {
			$exists: true
		}
	}, {
		sort: {
			createdAt: -1
		}
	})
})