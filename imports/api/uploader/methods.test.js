import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'
import fs from 'fs'
import CryptoJS from 'crypto-js'

import { callWithPromise } from '/imports/api/utilities'

import './methods'

Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({ profile: { name: 'Test User'}, moderator: true }) // stub user data as well
Meteor.user = () => ({ profile: { name: 'Test User'}, moderator: true })

// emurgis favicon 16x16 is small enough to be used here
const imageb64 = 'wolQTkcNChoKAAAADUlIRFIAAAAQAAAAEAgDAAAAKC0PUwAAAARnQU1BAADCscKPC8O8YQUAAAABc1JHQgDCrsOOHMOpAAAAIGNIUk0AAHomAADCgMKEAADDugAAAMKAw6gAAHUwAADDqmAAADrCmAAAF3DCnMK6UTwAAADCvVBMVEV9wrfDvRR9w7sVfsO7E33DuxZ+w7stwovDuzrCksO8OcKSw7w3wpHDvB3Cg8O7FH7Du8KAwrnDvRnCgMO7wprDh8O9w6TDsMO/w6HDr8O/w6LDr8O/w6PDr8O/w6PDsMO/w5TDp8O+RMKYw7wSfcO7F3/Du8KNw4DDvRrCgcO7wq7DksO+w7/Dv8O/w7fDusO/w6bDscO/w6XDscO/w5bDqcO+wo/DgcO9wq3DksO+wrvDmsO+O8KTw7w1wpDDvB3CgsO7wrzDmsO+P8KVw7w8wpPDvDTCj8O7GMKAw7vDuMO7w7/DqsOzw7/DqcOzw7/DrMO0w7/DgcOdw74nwojDu8Ouw7bDv8OPw6TDvsOOw6TDvsOQw6XDvsKrw5HDviTCh8O7wrTDlsO+KMKIw7skwobDuyHChMO7OMKRw7zDpcOww79pwqzDvMOhw67Dv2jCrMO8KRvDt8OUAAAAAWJLR0QadWfDpDIAAAAJcEhZcwAAAEgAAABIAEbDiWs+AAAAwpRJREFUGMOTTcOPw5cSw4IgEAVQSgwYK3ZjUBNLw6zCvSDClsO/w78sM8KEAMO7eGZ2w7deACByBgLCoABiNQbCvMKSTwjDsWkZBRUFw5Vawr3DkWTCrXbCp8Obw6srGAzDg1HDhMKjcQbCkxzCpmHCnFA6wpsHFhbDiyRdwq3CkcKFw412wrc/HMKhwoXDk8O5csK9w50deDzChXh5w45KwpxKKcKFOcKawr3DpW/Djj5YQx7CjH1/WAfDk8ORwokowqIXw6UCw5PDlsKpw78HwrNjD0rCmcOlTVsAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMDUtMjRUMTE6NTc6MDgrMDA6MDAdQMOpwpoAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTgtMDUtMjRUMTE6NTc6MDgrMDA6MDBsHVEmAAAARnRFWHRzb2Z0d2FyZQBJbWFnZU1hZ2ljayA2LjcuOC05IDIwMTQtMDUtMTIgUTE2IGh0dHA6Ly93d3cuaW1hZ2VtYWdpY2sub3Jnw5zChsOtAAAAABh0RVh0VGh1bWI6OkRvY3VtZW50OjpQYWdlcwAxwqfDv8K7LwAAABh0RVh0VGh1bWI6OkltYWdlOjpoZWlnaHQAMTkyDwBywoUAAAAXdEVYdFRodW1iOjpJbWFnZTo6V2lkdGgAMTkyw5PCrCEIAAAAGXRFWHRUaHVtYjo6TWltZXR5cGUAaW1hZ2UvcG5nP8KyVk4AAAAXdEVYdFRodW1iOjpNVGltZQAxNTI3MTYzMDI4w5ZEGQ4AAAAPdEVYdFRodW1iOjpTaXplADBCQsKUwqI+w6wAAABWdEVYdFRodW1iOjpVUkkAZmlsZTovLy9tbnRsb2cvZmF2aWNvbnMvMjAxOC0wNS0yNC80YWM1YTkxZDIyZGQ3YWQ0MTljOTJjMWEyZTQ1MmU0My5pY28ucG5nXcKrEMK8AAAAAElFTkTCrkJgwoI='
const imagemd5 = '651b2dc3d19e480c7be9e0717ab1caa2'

const pdfb64 = 'JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G'
const pdfmd5 = 'bcd0fc693cc6e5f6bbcd753e1932f18c'

describe('Image uploader API', () => {
    it('can upload an image', () => {
        return callWithPromise('uploadImage', {
            fileName: 'test.png',
            data: CryptoJS.enc.Base64.parse(imageb64).toString(CryptoJS.enc.Utf8),
            md5: imagemd5,
        }).then(data => {
            assert.ok(fs.existsSync(`/home/gareth/cardanoupdate_assets/static${data}`))
        })
    })

    it('can upload a pdf', () => {
        return callWithPromise('uploadPDF', {
            fileName: 'test.pdf',
            data: CryptoJS.enc.Base64.parse(pdfb64).toString(CryptoJS.enc.Utf8),
            md5: pdfmd5,
        }).then(data => {
            assert.ok(fs.existsSync(`/home/gareth/cardanoupdate_assets/static${data}`))
        })
    })
})
