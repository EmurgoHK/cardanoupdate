import { updateUsersStats } from './usersStats'

let onCreateUserCallBacks = [updateUsersStats]

Accounts.onCreateUser(( options, user ) => {
  onCreateUserCallBacks.forEach(x=>x(options, user))
  return ( user )
})