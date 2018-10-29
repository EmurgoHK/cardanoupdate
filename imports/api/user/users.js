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
  return ( user )
})