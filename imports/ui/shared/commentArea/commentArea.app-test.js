import { Meteor } from 'meteor/meteor';
// import StubCollections from 'meteor/hwillson:stub-collections';
// import { Template } from 'meteor/templating';

import {assert} from 'chai';

if (Meteor.isClient) {
  import "./commentArea";
  import "../commentCard/commentCard";
  import "../commentForm/commentForm";
  import "../userNameDisplay/userNameDisplay";
  import "../../helpers/handlebars-helpers";

  import { $ } from 'meteor/jquery';

  import {withRenderedTemplate, promiseCall, CallbackTester, waitUntil} from '../../uiUnitTestUtils';

  import '../../../api/user/methods';
  import '../../../api/comments/methods';
  import { Comments } from '../../../api/comments/comments';

  describe('commentArea', function() {
    this.timeout(30000);
    const defaultComment = {
      parentId: 'test-news-id',
      newsId: 'test-news-id',
      postType: 'test-news',
      type: 'test-comment',
      text: 'test comment Text',
    }
    function addComment(opts = {}) {
      const comment = Object.assign(
        {}, 
        defaultComment,
        opts.parentId && !opts.newsId ? {newsId: opts.parentId} : {},
        opts,
      );
      return promiseCall('newComment', comment);
    }

    before(async () => {/*
      Meteor.subscribe = () => ({
        subscriptionId: 0,
        ready: () => true,
      });
      Meteor.userId = () => 'test-user-id' */
      await promiseCall('generateTestUser', {});
      return await new Promise(res => Meteor.loginWithPassword('testing', 'testing', res));
    });
    after( () => Meteor.logout());

    beforeEach(() => {
      // StubCollections.stub([Comments]);
    });

    afterEach(() => {
      const comments = Comments.find({$or: [{postType: 'test-news'}, {type: 'test-comment'}, {newsId: 'test-news-id'}]}).map(c => c._id);
      return Promise.all(comments.map(id => promiseCall('removeComment', {commentId: id})));
      // StubCollections.restore();
    });

    it('should not display any comment cards if no comments are posted', async () => {
      await withRenderedTemplate('commentArea', {parentId: 'test-news-id', type: 'test-comment', postType: 'test-news'}, el => {
        const cards = $(el).find('.comments .card');
        assert.lengthOf(cards, 0);
      });
    });

    it('should display comment cards for comments under the set newsId and with set type', async () => {
      await Promise.all([
        addComment({parentId: 'test-news-id'}),
        addComment({parentId: 'test-news-id', type: 'testcommentdifferenttype'}),
        addComment({parentId: 'test-news-id', type: 'testcommentdifferenttype'}),
        addComment({parentId: 'test-news-id2'}),
        addComment({parentId: 'test-news-id2'}),
      ]);
      await withRenderedTemplate('commentArea', {parentId: 'test-news-id', type: 'test-comment', postType: 'test-news'}, async el => {
        const cards = $(el).find('.comments .card');
        assert.lengthOf(cards, 1);
        assert.equal($(el).find('.comments .card .card-text').text().trim(), 'test comment Text');
      });
    });

    it('should add comments and update to display the added comment', async () => {
      const cbTester = new CallbackTester();

      await withRenderedTemplate('commentArea', 
        {parentId: 'test-news-id', type: 'test-comment', postType: 'test-news', commentSuccess: cbTester.getCallback()}, 
        async el => {
          const root = $(el);

          root.find('textarea.comment-text').val('Freshly added comment');

          cbTester.expect();
          root.find('.save-comment').click();
          await cbTester.promise;

          const cards = root.find('.comments .card');
          assert.lengthOf(cards, 1);
          assert.equal($(cards[0]).find('.card-text').text().trim(), 'Freshly added comment');
        },
      );
    });
    
    it('should successfully post reply and show new comment', async () => {
      const cbTester = new CallbackTester();
      await addComment({parentId: 'test-news-id', text:'reply test'}),
      await withRenderedTemplate('commentArea', 
        {
          parentId: 'test-news-id', type: 'test-comment', postType: 'test-news', 
          commentSuccess: cbTester.getCallback(), replySuccess: cbTester.getCallback(), editSuccess: cbTester.getCallback(),
        }, 
        async el => {
          const root = $(el);
          const cards = root.find('.comments .card');
          assert.lengthOf(cards, 1);// Check how we start

          // Testing reply button
          $(cards[0]).find('.reply').click();

          // Changes to reply ui
          (await waitUntil(() => root.find('.comments textarea.comment-text'))).val('asdf')
          
          // successfully calls callbacks
          cbTester.expect();
          root.find('.comments .save-comment').click();
          await cbTester.promise;

          // New comment shows up
          await waitUntil(() => root.find('.comments .card').length > 1);

          // With the appropriate content
          const cardsAfterReply = root.find('.comments .card');
          assert.lengthOf(cardsAfterReply, 2);
          await waitUntil(() => $(root.find('.comments .card')[1]).find('.card-text').text().trim() === 'asdf');
        }
      );
    });

    it('should successfully edit comment', async () => {
      const cbTester = new CallbackTester();
      await addComment({parentId: 'test-news-id', text:'edit test'}),
      await withRenderedTemplate('commentArea', 
        {
          parentId: 'test-news-id', type: 'test-comment', postType: 'test-news', 
          commentSuccess: cbTester.getCallback(), replySuccess: cbTester.getCallback(), editSuccess: cbTester.getCallback(),
        }, 
        async el => {
          const root = $(el);
          const cards = root.find('.comments .card');
          assert.lengthOf(cards, 1);// Check how we start

          // Testing edit button
          $(cards[0]).find('.news-settings i.dropdown-toggle').click();
          $(cards[0]).find('.news-settings .edit-mode').click();
          
          // successfully loads text
          const input = await waitUntil(() => $(cards[0]).find('textarea.comment-text'));
          assert.equal(input.val(), 'edit test');

          // Setting changed text
          input.val('edit test changed');
          
          // successfully calls callbacks
          cbTester.expect();
          $(cards[0]).find('.save-comment').click();

          await cbTester.promise;

          // Changed value loads
          await waitUntil(() => root.find('.comments .card .card-text').text().trim() === 'edit test changed');
        }
      );
    });

    it('should successfully delete comment', async () => {
      const cbTester = new CallbackTester();
      await addComment({parentId: 'test-news-id', text:'delete test'}),
      await withRenderedTemplate('commentArea', 
        {
          parentId: 'test-news-id', type: 'test-comment', postType: 'test-news', 
          commentSuccess: cbTester.getCallback(), replySuccess: cbTester.getCallback(), editSuccess: cbTester.getCallback(),
        }, 
        async el => {
          const root = $(el);
          const cards = root.find('.comments .card');
          assert.lengthOf(cards, 1);// Check how we start

          // Testing edit button
          $(cards[0]).find('.news-settings i.dropdown-toggle').click();
          $(cards[0]).find('.news-settings .delete-comment').click();
          
          (await waitUntil(() => $('.swal2-container .swal2-confirm'))).click();

          // We have 0 cards
          await waitUntil(() => root.find('.comments .card').length === 0);
        }
      );
    });

    it('should successfully flag comment', async () => {
      const cbTester = new CallbackTester();
      await addComment({parentId: 'test-news-id', text:'flag test'}),
      await withRenderedTemplate('commentArea', 
        {
          parentId: 'test-news-id', type: 'test-comment', postType: 'test-news', 
          commentSuccess: cbTester.getCallback(), replySuccess: cbTester.getCallback(), editSuccess: cbTester.getCallback(),
        }, 
        async el => {
          const root = $(el);
          const cards = root.find('.comments .card');
          assert.lengthOf(cards, 1);// Check how we start

          // Testing edit button
          $(cards[0]).find('.news-settings i.dropdown-toggle').click();
          $(cards[0]).find('.news-settings .flag-comment').click();
          
          const swal = await waitUntil(() => $('.swal2-container'));
          swal.find('.swal2-input').val('test flag reason');
          swal.find('.swal2-confirm').click()

          await waitUntil(() => Comments.findOne({text: 'flag test', parentId: 'test-news-id', flags: {$elemMatch: {reason: 'test flag reason'}}}));
        }
      );
    });
  });
}