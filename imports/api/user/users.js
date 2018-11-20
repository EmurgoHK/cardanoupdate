import { updateUsersStats } from './usersStats'

let onCreateUserCallBacks = [updateUsersStats]

Accounts.onCreateUser(( options, user ) => {
  onCreateUserCallBacks.forEach(x=>x(options, user))
  /* 
  	Profile object not send when user created, which contains name
  	Author: Gunjan Patel
  */
  if(options.profile){
  	user.profile = options.profile
  }
  
  // Send Verification Email on Sign UP
  Meteor.setTimeout(function() {
    Accounts.sendVerificationEmail(user._id)
  }, 2 * 1000)

  return ( user )
})

// Custom Verify Email Template
Accounts.emailTemplates.verifyEmail = {
  from() {
    return "Cardano Update Space <no-reply@cardanoupdate.space"
  },
  subject() {
    return "Activate your account on Cardano Update Space.";
  },
  text(user, url) {
    return `Hey ${user.profile.name}! \n\n Verify your e-mail on Cardano Update Space by clicking this link: ${url}`;
  }
};