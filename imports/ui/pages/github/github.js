import './github.html'
import './github.scss'

import { Template } from 'meteor/templating';
 
 
Template.body.helpers({
  tasks: [
    { text: 'This is task 1' },
    { text: 'This is task 2' },
    { text: 'This is task 3' },
  ],
});