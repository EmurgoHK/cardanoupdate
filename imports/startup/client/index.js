import './config'
import './testing'

// import main templates
import '/imports/ui/layouts/auth/auth'
import '/imports/ui/layouts/body/body'
import '/imports/ui/shared/header/header'
import '/imports/ui/shared/sidebar/sidebar'
import '/imports/ui/shared/loader/loader'
import '/imports/ui/shared/empty-result/empty-result'
import '/imports/ui/shared/uploader/uploader'

import '/imports/ui/shared/eventCard/eventCard';
import '/imports/ui/shared/learningResourceCard/learningResourceCard';
import '/imports/ui/shared/projectCard/projectCard';
import '/imports/ui/shared/researchCard/researchCard';
import '/imports/ui/shared/socialResourceCard/socialResourceCard';
import '/imports/ui/shared/warningCard/warningCard';
import '/imports/ui/shared/flagItem/flagItem';
import '/imports/ui/shared/tagInput/tagInput';

import '/imports/ui/shared/userNameDisplay/userNameDisplay';

import '/imports/ui/shared/commentForm/commentForm';

import '/imports/ui/shared/searchBar/searchBar';
import '/imports/ui/shared/searchResults/searchResults';

// Blaze helpers
import '/imports/ui/helpers/handlebars-helpers'

import "bootstrap"

Meteor.startup(() => {
    reCAPTCHA.config({
        publickey: Meteor.settings.public.RECAPTCHA_CLIENT
    });
})