import swal from 'sweetalert2'

export async function loginSWAL(opts, callback) {
  $('#loginModal').modal('show')
  // const modalFn = Meteor.wrapAsync(getModalCallback)
  // return await modalFn()
  return { value: false }
  // const result = await swal({
  //   type: 'warning',
  //   title: TAPi18n.__('shared.loginModal.title', {action: TAPi18n.__(opts.action, 'shared.loginModal.defaultAction')}),
  //   confirmButtonText: TAPi18n.__('shared.loginModal.login'),
  //   cancelButtonText: TAPi18n.__('shared.loginModal.cancel'),
  //   showCancelButton: true,
  // });
  //
  // if (result.value) {
  //   FlowRouter.go('/login?from=' + FlowRouter.current().path);
  //   return {value: false};
  // } else {
  //   return result;
  // }
}

export async function loggedInSWAL(swalOpts) {
  if (!Meteor.userId()) {
    return loginSWAL(swalOpts);
  } else {
    return swal(swalOpts);
  }
}

// const getModalCallback = function (callback) {
//   $('#loginModal').on('hide.bs.modal', () => {
//     callback && callback(null, {value: true})
//   })
// }
