import '/imports/startup/client'
import '/imports/startup/both'

import('select2').then(select => window.$ = select.default('', window.$))
