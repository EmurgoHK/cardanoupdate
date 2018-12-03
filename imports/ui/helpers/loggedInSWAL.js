import swal from 'sweetalert2'

export async function loginSWAL(opts) {
  const result = await swal({
    type: 'warning',
    title: TAPi18n.__('shared.loginModal.title', {action: TAPi18n.__(opts.action, 'shared.loginModal.defaultAction')}),
    confirmButtonText: TAPi18n.__('shared.loginModal.login'),
    cancelButtonText: TAPi18n.__('shared.loginModal.cancel'),
    showCancelButton: true,
  });
  
  if (result.value) {
    FlowRouter.go('/login?from=' + FlowRouter.current().path);
    return {value: false};
  } else {
    return result;
  }
}

export async function loggedInSWAL(swalOpts) {
  if (!Meteor.userId()) {
    return loginSWAL(swalOpts);
  } else {
    return swal(swalOpts);
  }
}