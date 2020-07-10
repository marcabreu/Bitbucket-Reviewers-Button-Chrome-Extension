/* eslint-env amd */
/* globals bitbucket, aui, WRM, AJS, template */

;(function() {

	// bitbucket page must have require function
	if(typeof window.define === 'undefined' || typeof window.require === 'undefined' || typeof window.bitbucket === 'undefined')
		return;

	// workaround to fix missing firefox onMessageExternal
	if(!window.chrome || !window.chrome.runtime || typeof(window.chrome.runtime.sendMessage) !== 'function') {
		window.communication = {
			runtime : {
				sendMessage(extId, msg, callback) {
					const randEventId = Math.floor((Math.random() * 1000) + 1);
					msg.eventId = randEventId;
					msg.extId = extId;
					window.postMessage(msg, '*');
					if(callback) {
						window.addEventListener("message", function (eventArgs) {
							if(eventArgs.data.identifier === randEventId)
								callback(eventArgs.data.backgroundResult);
						});
					}
				}
			}
		};
	} else {
		window.communication = {
			runtime: {
				sendMessage: window.chrome.runtime.sendMessage
			}
		};
    }
    
    define('bitbucket-plugin/pullrequest-create-page', [
		'jquery'
	], function (
		jQuery
	) {
		'use strict';
		const listId = "ul_reviewers_list";
		const reviewersDataKey = "reviewers";
		const buttonIconId = "img_group_icon";

		function getGroupIcon(){
			return `<img id="${buttonIconId}" style="width:16px; height:16px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAABiElEQVRIS72V/zEEQRCFv4sAESADIkAEZIAMXASIABEgAyJABC4DRIAIqE/NXu3Oza/aOtf/bO1uT7/u1697JqzAJivAoAZyBBwCWyGZGXAJfIX3HWAN+ADecwmXQO6A48RBg/nvBhB0M/g8hAT8NrAcyAlwW6Gyq+gq8tsN4PPPOZBnYK8CYkUG/Iz8HgFproLIuVzXzCR/IqcXYL8FJD5Y6ulokBa6VJQZv0UZKIizlkpUitItmdxfA0//2RP7tp1o/D2gOquNb6HLBkvLay/ed6BwMCs5CTvJ/cMp2pSvIP2BXajCg6WJL/XFflwkEtnorZwqXTqUqjkIvMdrJ5l0bUHm5iU1hCbmTpvG1YwFkRbpzK0eweyPAsr2xNXughysh173PXwa3m2+kk2tIedoGleiszzngscqE8ysFYLP1ADPQWyymfscY86Flbl9z6MAMyuRGmdifUz03hk3gLOjtLub9O+3ILkbcAzmwl3SgbTeHS2gxlJ5A7MSy1umLcSrzclSwH8BMXpPGYwvvtgAAAAASUVORK5CYII="/>`;
		}

		function getGroupIconLoader(){
			return `<img id="${buttonIconId}" src="data:image/gif;base64,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"/>`;
		}

		/**
		 * Use bitbucket api to search for the user
		 * @param {integer} term name or email of the user to search.
		 */
		function searchUsersAsync(term) {
			const deferred = jQuery.Deferred();

			const searchParams = { avatarSize: 32, permission: "LICENSED_USER", start: 0, filter: term };

			jQuery.get( "/bitbucket/rest/api/latest/users", searchParams)
				.done(function( data ) {
					if (data.values.length > 0)
					{
                        const rawd = data.values[0];
						const select2Data = {
							id: rawd.name,
							text: rawd.displayName || rawd.name,
							item: rawd };

						deferred.resolve(select2Data);
					}

					deferred.resolve(null);
				})
				.fail(function(){
				// use resolve instead of reject to avoid prematured end with $.when
					deferred.resolve(null);
				});

			return deferred.promise();
		}

		function attachDropdownClickEvent(dropdown) {
			jQuery(dropdown).find(`#${  listId}`).find('li').click(function() {
				const $element = jQuery(this);
				const reviewers = $element.data(reviewersDataKey);
				const differedList = [];
				const select2DataArray = [];

				// show loader
				jQuery(`#${buttonIconId}`).replaceWith(getGroupIconLoader());

				reviewers.forEach(function(reviewer){
					// request user data from search api
					const searchDeferred = searchUsersAsync(reviewer);
					// waiting list
					differedList.push(searchDeferred);
					// add to the array
					searchDeferred.done(function(select2Data){
						if(select2Data && pageState.getCurrentUser().id !== select2Data.item.id) {
							select2DataArray.push(select2Data);
						}
					});
				});

				jQuery.when.apply(jQuery, differedList).done(function() {
					// redisplay icon and remove loader
					jQuery(`#${buttonIconId}`).replaceWith(getGroupIcon());

					const replacePrevious = jQuery('#replaceGroups').is(':checked') || false;
					//////////// update the user selector
					// need this to reproduce the event triggered by select2 on a single selection. (change Event contain "added" or "removed" property set with an object and not an array)
					// Without that the widget/searchable-multi-selector wrapper made by atlassian won't change his data internally corrrectly

					// clean (for atlassian wrapper)
					const allUsers = AJS.$('#reviewers').auiSelect2("data");
					AJS.$('#reviewers').auiSelect2("data", null).trigger("change");
					AJS.$('#reviewers').auiSelect2("val", null).trigger("change");
					allUsers.forEach(function(item){
						const e = new jQuery.Event("change");
						e.removed = item;
						AJS.$('#reviewers').trigger(e);
					});

					if (!replacePrevious) {
						jQuery.merge(select2DataArray, allUsers);
					}

					// add (for atlassian wrapper)
					select2DataArray.forEach(function(select2Data){
						const e = new jQuery.Event("change");
						e.added = select2Data;
						AJS.$('#reviewers').trigger(e);
					});

					// update displayed value (for select2)
					AJS.$('#reviewers').auiSelect2("data", select2DataArray);
				});
			});
		}

		function injectReviewersDropdown(jsonGroups) {
			const $reviewersInput = jQuery('#s2id_reviewers');
			if ($reviewersInput.length == 0) {
				return;
			}

			// empty dropdown for reviewers group
			let checkedProperty = '';
			if( Boolean(localStorage.getItem('replaceGroupsState') || false) === true ){
				checkedProperty = ' checked="checked"';
			}

			const dropdownHTML = ([
				'<a href="#reviewers_list" aria-owns="reviewers_list" aria-haspopup="true" class="aui-button aui-style-default aui-dropdown2-trigger" style="margin-left: 10px; display: inline-block; top: -10px;">',
				getGroupIcon(),
				'</a>',
				'<div id="reviewers_list" class="aui-style-default aui-dropdown2">',
				`<ul class="aui-list-truncate" id="${ listId }">`,
				'</ul>',
				'</div>',
				'<div class="checkbox" id="replaceGroupsDiv">',
				`<input class="checkbox" type="checkbox" name="replaceGroups" id="replaceGroups"${checkedProperty}>`,
				'<label for="replaceGroups">Replace</label>',
				'</div>'
			]).join("\n");

			// jquery instance
			const $dropdown = jQuery(dropdownHTML);

			// add groups list
			jsonGroups.groups.forEach(function(group) {
				const linkText = `${group.groupName  } (${  group.reviewers.length  } reviewers)`;
				const $a = jQuery('<a href="Javascript:void(0)"></a>').text(linkText);
				const $li = jQuery('<li></li>').append($a).data(reviewersDataKey, group.reviewers);
				$dropdown.find(`#${  listId}`).append($li);
			});


			// click event
			attachDropdownClickEvent($dropdown);

			// save checkbox state on change
			$dropdown.find('#replaceGroups').on('change', function() {
				const state = jQuery(this).is(':checked') || false;
				localStorage.setItem('replaceGroupsState', state);
			});

			// fix z-index bug
			$dropdown.on({
				"aui-dropdown2-show"() {
					window.setTimeout(function(){
						jQuery("#reviewers_list").css("z-index", "4000");
					}, 50);
				}
			});

			// append to the page
			$reviewersInput.after($dropdown);
		}

		return {
			injectReviewersDropdown
		};
    });
    

    require([ 'jquery' ], extensionInit);

    function extensionInit(jQuery) {
		let pageState;
		const loadRequirement = jQuery.Deferred();
		const loadAuiFlag = jQuery.Deferred();
		// const loadPrRequirement = jQuery.Deferred();

		try {
			WRM.require("wr!" + 'com.atlassian.auiplugin:aui-flag').then(function() {
				loadAuiFlag.resolve();
			});
		}
		catch (_) {
			// optional
			loadAuiFlag.resolve();
		}

		try {
			pageState = require('bitbucket/util/state');
			loadRequirement.resolve();
		}
		catch (_) {
			try {
				WRM.require("wr!" + 'com.atlassian.bitbucket.server.bitbucket-web-api:state').then(function(){
					pageState = require('bitbucket/util/state');
					loadRequirement.resolve();
				});
			}
			catch (_) {
				loadRequirement.reject();
			}
		}

		jQuery.when(loadRequirement, loadAuiFlag).done(function(){
			const user = pageState.getCurrentUser();
			const project = pageState.getProject();
			const repository = pageState.getRepository();
			const pullRequest = pageState.getPullRequest();

			if(project && repository && !pullRequest) {

				// PR Reviewers groups (create page)
				require(['bitbucket-plugin/pullrequest-create-page'], function(prCreateUtil){
					if(window.featuresData.reviewersgroup == 1)
						prCreateUtil.injectReviewersDropdown(jsonGroups);
				});

			}
		});
    }
}());
// Note: to see all bitbucket events add ?eve=* to URL