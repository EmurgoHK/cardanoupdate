import './warnings.html'
 import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

Template.warnings.onCreated(function () {
    this.sort = new ReactiveVar('date-desc')
    this.searchFilter = new ReactiveVar(undefined);
    
    this.autorun(() => {
        this.subscribe('warnings')
    })
})
 Template.warnings.helpers({
    searchArgs() {
        const instance = Template.instance();
        return {
            placeholder:"Search scams",
            type: 'warnings',
            onChange: (newTerm) => instance.searchFilter.set(newTerm),
        }
    },
    resultArgs() {
        return {
            types: ['warnings'],
            searchTerm: Template.instance().searchFilter.get(),
        }
    },
})
 Template.warnings.events({
     // Remove comments if user is allowed to propose changes
    /*
    'click .github': function(event, temlateInstance) {
        if ($(event.currentTarget).attr('href')) {
            return
        }
         swal({
            text: `GitHub repo is not available. If you know this information, please contribute below:`,
            type: 'warning',
            showCancelButton: true,
            input: 'text'
        }).then(val => {
            if (val.value) {
                proposeNewDataWarning.call({
                    projectId: this._id,
                    datapoint: 'github_url',
                    newData: val.value,
                    type: 'link'
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    } else {
                        notify('Successfully contributed.', 'success')
                    }
                })
            }
        })
    },
    'click .website': function(event, temlateInstance) {
        if ($(event.currentTarget).attr('href')) {
            return
        }
         swal({
            text: `Website is not available. If you know this information, please contribute below:`,
            type: 'warning',
            showCancelButton: true,
            input: 'text'
        }).then(val => {
            if (val.value) {
                proposeNewDataWarning.call({
                    projectId: this._id,
                    datapoint: 'website',
                    newData: val.value,
                    type: 'link'
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    } else {
                        notify('Successfully contributed.', 'success')
                    }
                })
            }
        })
    },
    */
     'click #add-warning': (event, _) => {
        event.preventDefault()
        FlowRouter.go('/scams/new')
    },
})