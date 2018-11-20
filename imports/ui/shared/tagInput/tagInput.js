import "./tagInput.html";

import { Tags } from '/imports/api/tags/tags'

import { Template } from "meteor/templating";
import _ from 'lodash'

import 'select2'

Template.tagInput.onCreated(function() {
    this.subscribe('tags')
})

Template.tagInput.onRendered(function() {
    this.autorun(() => {
        $('#tags').val(this.data.values.map(t => t.name))
        $('#tags').trigger('change')
    })

    $('#tags').select2({
        tags: true,
        tokenSeparators: [' ', ','],
        allowClear: true,
        placeholder: TAPi18n.__('shared.tags.placeholder')
    })
})

Template.tagInput.helpers({
    tags: () => {

        let tags = Array.from(Tags.find({
            name: {
                $not: new RegExp('built-(for|on)-cardano', 'i') // dont include these tags
            }
        }))

        tags = _.uniqBy(tags, 'name');
        return tags
    },
    'isTagIncluded': (tagId) => {
        let tags = Template.instance().data.values
        let x = tags != [] && _.find(tags, (tag) => tag.id ===  tagId ) ? 'selected' : ''
        return x
    }
})

