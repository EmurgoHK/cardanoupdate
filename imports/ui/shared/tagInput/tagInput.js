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
        console.log(this.data.values)
        $('#tags').val(this.data.values.map(t => t.name))
        $('#tags').trigger('change')
    })

    $('#tags').select2({
        tags: true,
        tokenSeparators: [' ', ','],
        allowClear: true,
        placeholder: 'Add a tags separated by comma(,) e.g. crypto,wallet'
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

