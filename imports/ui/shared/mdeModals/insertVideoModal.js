import { notify } from '/imports/modules/notifier';

import SimpleMDE from 'simplemde';
import swal from 'sweetalert2';

import { replaceSelection } from './replaceSelection';

export const insertVideoModal = editor => {
	const cm = editor.codemirror;
	const state = SimpleMDE.prototype.getState.call(editor);
	const options = editor.options;
	swal({
		title: TAPi18n.__('learn.form.youtube'),
		input: 'text',
		showCancelButton: true,
		inputValidator: (value) => {
			return !/youtu(\.|)be/.test(value) && TAPi18n.__('learn.form.invalid_yt');
		}
	}).then(data => {
		if (data.value) {
			let videoId = data.value.match(/(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&"'>]+)/)[5]; // fairly complex regex that extracts video id from the youtube link
			if (videoId && /[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]/.test(videoId)) { // videoId has certain constrains so we can check if it's valid
				replaceSelection(cm, state.video, ['<iframe width="560" height="315" ', 'src="#url#" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'], `https://www.youtube.com/embed/${videoId}`);
			}
			else {
				notify(TAPi18n.__('learn.form.invalid_yt'), 'error');
			}
		}
	});
};
