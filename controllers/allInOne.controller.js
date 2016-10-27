app.controller('allInOneController', ['$scope', '$timeout', '$location',
    function ($scope, $timeout, $location) {
// app.service('ReleaseFlowManager', ['$http', '$q', 'Jira', 'Confluence', 'GitHub', 'User',
//     function ($http, $q, Jira, Confluence, GitHub, User) {
//
//         this.releaseVersion = function (currentVersion, newVersion, prerelease) {
//             var fecs;
//             return Github.commitAndTagVersion(currentVersion, newVersion)
//                 .then(function (success) {
//                     if (success) {
//                         return Github.getCommitsSinceLastRelease();
//                     } else {
//                         throw new Error();
//                     }
//                 })
//                 .then(function (commits) {
//                     if (commits) {
//                         fecs = _extractFECs(commits);
//                         if (fecs.withJiraTicket.length > 0) {
//                             return Jira.getIssues(fecs.withJiraTicket);
//                         }
//                         else {
//                             return null;
//                         }
//                     } else {
//                         throw new Error();
//                     }
//                 })
//                 .then(function (jiras) {
//                     var titles = _extractTitles(jiras);
//                     titles = titles.concat(fecs.withOutJiraTicket);
//                     return Github.createReleaseNotes(newVersion, titles, prerelease);
//                 })
//                 .then(function (release) {
//                     if (release) {
//                         return Jira.changeAssignee(fecs.withJiraTicket);
//                     }
//                     else {
//                         throw new Error();
//                     }
//                 })
//                 .then(function (results) {
//                     _.forEach(results, function (result) {
//                         if (!result) {
//                             throw new Error();
//                         }
//                     });
//                     return Jira.changeStatuses(fecs.withJiraTicket);
//                 })
//                 .then(function (results) {
//                     //TODO: Confluence page
//                     //TODO: Send mail?
//                 });
//         };
//
//         function _extractTitles(jiras) {
//             var titles = [];
//             if (jiras) {
//                 for (var i = 0; i < jiras.length; i++) {
//                     var jira = jiras[i];
//                     titles.push(jira.fields.summary);
//                 }
//             }
//             return titles;
//         }
//
//         function _extractFECs(commits) {
//             var keys = {withJiraTicket: [], withOutJiraTicket: []};
//             for (var i = 0; i < commits.length; i++) {
//                 var commit = commits[i];
//                 var msg = commit.commit.message;
//                 var regexp = /[A-Z]{3}-[0-9]{4}/g;
//                 var keys_results = msg.match(regexp);
//                 if (keys_results && keys_results.length) {
//                     for (var j = 0; j < keys_results.length; j++) {
//                         if (_.indexOf(keys.withJiraTicket, keys_results[j]) === -1) {
//                             keys.withJiraTicket.push(keys_results[j]);
//                         }
//                     }
//                 }
//                 else {
//                     var lines = msg.split('\n');
//                     keys.withOutJiraTicket.push(lines[0]);
//                 }
//             }
//             return keys;
//         }
//     }]);
    }]);