import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { uploadImage, uploadPDF } from '/imports/api/uploader/methods'
import { notify } from '/imports/modules/notifier'

import('crypto-js').then(c => window.CryptoJS = c.default)

import './uploader.html'

// use getFiles to get all uploaded files from the uploader
// reset boolean flag marks if the upload form should reset to original state when you call getFiles (useful when adding comments, not needed when creating problems)
// returns a simple array with file paths as strings
export const getFiles = (reset) => {
    reset = reset || false

    let upInstance = Blaze.getView($('#fileInput')[0])._templateInstance

    let files = upInstance.files.get()

    if (reset) {
        upInstance.files.set([])

        $('#fileUploadValue').html('Upload')
        $('#fileInputLabel').addClass('btn-primary').removeClass('btn-success')          
    }              

    return files
}

Template.uploader.onCreated(function() {
    this.files = new ReactiveVar([])

    if (this.data.files) {
        this.files.set(this.data.files)
    }

    this.type = this.data.type || 'image'
})

Template.uploader.helpers({
    files: () => Template.instance().files.get(),
    image: () => Template.instance().type === 'image',
    pdf: () => Template.instance().type === 'pdf'
})

Template.uploader.events({
    'change #fileInput': (event, templateInstance) => {
        const file = event.target.files[0]

        if (file) {
            $('#fileUploadValue').html('<i class=\'fas fa-circle-notch fa-spin\'></i> Uploading')

            const reader = new FileReader()

            reader.onload = fileLoadEvent => {
                const data = reader.result
                const md5 = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(data)).toString()

                let uploadFn

                if (templateInstance.type === 'image') {
                    uploadFn = uploadImage
                }

                if (templateInstance.type === 'pdf') {
                    uploadFn = uploadPDF
                }
                
                uploadFn.call({
                    fileName: file.name,
                    data: reader.result,
                    md5: md5
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    } else {
                        if (!templateInstance.data.single) {
                            let files = templateInstance.files.get()
                            files.push(data)
                            templateInstance.files.set(files)

                            $('#fileUploadValue').html('Upload another')
                            $('#fileInputLabel').removeClass('btn-primary').removeClass('btn-danger').addClass('btn-success')
                        } else {
                            templateInstance.files.set([data])

                            $('#fileUploadValue').html('Change')
                            $('#fileInputLabel').removeClass('btn-primary').removeClass('btn-danger').addClass('btn-success')
                        }
                    }
                })
            }

            reader.readAsBinaryString(file)
        }
    }
})