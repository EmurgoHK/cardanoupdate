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

  /*
        Send email verification on new user registration
  */
  Meteor.setTimeout(function() {
    Accounts.sendVerificationEmail(user._id)
  }, 2 * 1000)

  return ( user )
})

/* 
     Email Template for  Email Verification
*/

Accounts.emailTemplates.verifyEmail = {
  from() {
    return "Cardano Update Space <no-reply@cardanoupdate.space"
  },
  subject() {
    return "Activate your account on Cardano Update Space.";
  },
  html(user, url) {

    return `
    <!DOCTYPE html>
      <html lang="en" xmlns="http://www.w3.org/1999/xhtml">

      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Cardano Update Space - Email</title>
      </head>

      <body>
        <div style="
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          background: #fff;
          ">

          <div style="
          position: relative;
          background: url('https://cardanoupdate.space/img/banner.png');
          background-size: cover;
          width: 100%;
          height: 150px;
          ">
          <img src="https://cardanoupdate.space/img/logo.png" alt="cardano-update-space-logo" style="
            position: relative;
            width: 200px;
            margin-top: 50px;
          " />
          </div>
          <div style="
              padding: 20px;
            ">
            <p style="
              font-size: 18px;
              margin-bottom: 20px;
            ">Hello ${user.profile.name},</p>
            <p style="
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
            ">
              Thanks for joining Cardano Update Space
            </p>
            <p style="
              font-size: 14px;
              margin-bottom: 20px;
            ">
              Please confirm that your email address is correct to continue. Click the link below to get started
            </p>
            <a href="${url}" style="
              display: inline-block;
              border: none;
              padding: 16px;
              font-size: 16px;
              background: #4dbd74;
              color: #fff;
              font-weight: bold;
              text-decoration: none;
              border-radius: 5px;
            ">Confrim
              Email Address</a>
          </div>
          <div>
            <a href="https://cardanoupdate.space/" style="
                margin: 20px;
                position: relative;
                display: inline-block;
                color: #20a8d8;
                text-decoration: none;  
              ">Cardano
              Update Space</a>
          </div>
        </div>
      </body>

      </html>
    `
  }
};

/* 
    Email Template for Reset Password
*/

Accounts.emailTemplates.resetPassword = {
  from() {
    return "Cardano Update Space <no-reply@cardanoupdate.space"
  },
  subject() {
    return "Reset your password.";
  },
  html(user, url) {
    return `<!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Cardano Update Space - Email</title>
    </head>

    <body>
      <div style="
        position: relative;
        max-width: 800px;
        margin: 0 auto;
        background: #fff;
        ">

        <div style="
        position: relative;
        background: url('https://cardanoupdate.space/img/banner.png');
        background-size: cover;
        width: 100%;
        height: 150px;
        ">
        <img src="https://cardanoupdate.space/img/logo.png" alt="cardano-update-space-logo" style="
          position: relative;
          width: 200px;
          margin-top: 50px;
        " />
        </div>
        <div style="
            padding: 20px;
          ">
          <p style="
            font-size: 18px;
            margin-bottom: 20px;
          ">Hello ${user.profile.name},</p>
          <p style="
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
          ">
            Oops !
          </p>
          <p style="
            font-size: 14px;
            margin-bottom: 20px;
          ">
            Looks like you forgot your password. Don't worry, We got your back. <br/> 
            Please click on below link to reset your password.
          </p>
          <a href="${url}" style="
            display: inline-block;
            border: none;
            padding: 16px;
            font-size: 16px;
            background: #4dbd74;
            color: #fff;
            font-weight: bold;
            text-decoration: none;
            border-radius: 5px;
          ">Reset Password</a>
        </div>
        <div style="
          margin-top: 20px;
          margin-bottom: 10px;
        ">
          <a href="https://cardanoupdate.space/" style="
              margin: 20px;
              position: relative;
              display: inline-block;
              color: #20a8d8;
              text-decoration: none;  
            ">Cardano Update Space</a>
        </div>
      </div>
    </body>

    </html>`
  }
}

/* 
    Email Template for Welcome (on enrollAccount)
    
*/

Accounts.emailTemplates.enrollAccount = {
  from() {
    return "Cardano Update Space <no-reply@cardanoupdate.space"
  },
  subject() {
    return "Welcome to Cardano Update Space.";
  },
  html(user, url) {
    return `<!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Cardano Update Space - Email</title>
    </head>

    <body>
      <div style="
        position: relative;
        max-width: 800px;
        margin: 0 auto;
        background: #fff;
        ">

        <div style="
        position: relative;
        background: url('https://cardanoupdate.space/img/banner.png');
        background-size: cover;
        width: 100%;
        height: 150px;
        ">
        <img src="https://cardanoupdate.space/img/logo.png" alt="cardano-update-space-logo" style="
          position: relative;
          width: 200px;
          margin-top: 50px;
        " />
        </div>
        <div style="
            padding: 20px;
          ">
          <p style="
            font-size: 18px;
            margin-bottom: 20px;
          ">Hello ${user.profile.name},</p>
          <p style="
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
          ">
            We are glad to welcome you.
          </p>
          <p style="
            font-size: 14px;
            margin-bottom: 20px;
          ">
            Before you can be part of our community, we want you to set your password. <br/> 
            Please click on below button to continue.
          </p>
          <a href="${url}" style="
            display: inline-block;
            border: none;
            padding: 16px;
            font-size: 16px;
            background: #4dbd74;
            color: #fff;
            font-weight: bold;
            text-decoration: none;
            border-radius: 5px;
          ">Verify Email</a>
        </div>
        <div style="
          margin-top: 20px;
          margin-bottom: 10px;
        ">
          <a href="https://cardanoupdate.space/" style="
              margin: 20px;
              position: relative;
              display: inline-block;
              color: #20a8d8;
              text-decoration: none;  
            ">Cardano Update Space</a>
        </div>
      </div>
    </body>

    </html>`
  }
}