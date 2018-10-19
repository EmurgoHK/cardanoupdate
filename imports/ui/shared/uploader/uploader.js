import { Template } from 'meteor/templating'
import { FlowRouter } from 'meteor/kadira:flow-router'

import { uploadImage, uploadPDF } from '/imports/api/uploader/methods'
import { notify } from '/imports/modules/notifier'

import('crypto-js').then(c => window.CryptoJS = c.default)
import swal from 'sweetalert2'
import SimpleMDE from 'simplemde'

import './uploader.html'

const replaceSelection = (cm, active, startEnd, url) => {
    if (/editor-preview-active/.test(cm.getWrapperElement().lastChild.className)) {
        return
    }

    let text
    let start = startEnd[0]
    let end = startEnd[1]

    let startPoint = cm.getCursor('start')
    let endPoint = cm.getCursor('end')

    if (url) {
        end = end.replace('#url#', url)
    }

    if (active) {
        text = cm.getLine(startPoint.line)
        start = text.slice(0, startPoint.ch)
        end = text.slice(startPoint.ch)

        cm.replaceRange(start + end, {
            line: startPoint.line,
            ch: 0
        })
    } else {
        text = cm.getSelection()
        cm.replaceSelection(start + text + end)

        startPoint.ch += start.length
        if(startPoint !== endPoint) {
            endPoint.ch += start.length
        }
    }

    cm.setSelection(startPoint, endPoint)
    cm.focus()
}

export const insertImage = (editor) => {
    const cm = editor.codemirror

    const state = SimpleMDE.prototype.getState.call(editor)
    const options = editor.options

    let view

    swal({
        title: 'Insert image',
        html: '<div id="uploader"></div>',
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: '<i class="fa fa-plus"></i> Insert',
        confirmButtonAriaLabel: 'Insert image!',
        cancelButtonText: 'Cancel',
        cancelButtonAriaLabel: 'Cancel',
    }).then(data => {
        if (data.value) {
            let files = getFiles('modal', true)

            if (files.length) {
                replaceSelection(cm, state.image, ['![](', '#url#)'], `https://cardanoupdate.space${files[0]}`)
            }
        }

        Blaze.remove(view)
    })

    view = Blaze.renderWithData(Template.uploader, {
        files: [],
        type: 'image',
        id: 'modal',
        single: true
    }, $('#uploader').get(0))
}

// use getFiles to get all uploaded files from the uploader
// reset boolean flag marks if the upload form should reset to original state when you call getFiles (useful when adding comments, not needed when creating problems)
// returns a simple array with file paths as strings
export const getFiles = (id, reset) => {
    reset = reset || false
    id = id || 'default'

    let upInstance = Blaze.getView($(`#fileUploadValue-${id}`)[0])._templateInstance

    let files = upInstance.files.get()

    if (reset) {
        upInstance.files.set([])

        $(`#fileUploadValue-${id}`).html('Upload')
        $(`#fileInputLabel-${id}`).addClass('btn-primary').removeClass('btn-success')          
    }              

    return files
}

Template.uploader.onCreated(function() {
    this.files = new ReactiveVar([])

    this.data = this.data || {}

    if (this.data.files) {
        this.files.set(this.data.files)
    }

    this.type = this.data.type || 'image'
    this.id = this.data.id || 'default'
})

Template.uploader.helpers({
    files: () => Template.instance().files.get(),
    image: () => Template.instance().type === 'image',
    pdf: () => Template.instance().type === 'pdf',
    id: () => Template.instance().id
})

Template.uploader.events({
    'change .fileInput': (event, templateInstance) => {
        if ($(event.target).data('id') !== templateInstance.id) { // don't react to events that aren't yours
            return 
        }

        const file = event.target.files[0]

        if (file) {
            $(`#fileUploadValue-${templateInstance.id}`).html('<i class=\'fas fa-circle-notch fa-spin\'></i> Uploading')

            const reader = new FileReader()

            reader.onloadend = fileLoadEvent => {
                const data = reader.result

                let uploadFn

                if (templateInstance.type === 'image') {
                    uploadFn = uploadImage
                }

                if (templateInstance.type === 'pdf') {
                    uploadFn = uploadPDF
                }
                
                uploadFn.call({
                    fileName: file.name,
                    data: data,
                    md5: CryptoJS.MD5(CryptoJS.enc.Latin1.parse(data.trim())).toString()
                }, (err, data) => {
                    if (err) {
                        notify(err.reason || err.message, 'error')
                    } else {
                        if (!templateInstance.data.single) {
                            let files = templateInstance.files.get()
                            files.push(data)
                            templateInstance.files.set(files)

                            $(`#fileUploadValue-${templateInstance.id}`).html('Upload another')
                            $(`#fileInputLabel-${templateInstance.id}`).removeClass('btn-primary').removeClass('btn-danger').addClass('btn-success')
                        } else {
                            templateInstance.files.set([data])

                            $(`#fileUploadValue-${templateInstance.id}`).html('Change')
                            $(`#fileInputLabel-${templateInstance.id}`).removeClass('btn-primary').removeClass('btn-danger').addClass('btn-success')
                        }
                    }
                })
            }

            reader.readAsBinaryString(file)
        }
    }
})