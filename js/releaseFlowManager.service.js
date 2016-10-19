app.service('ReleaseFlowManager', ['$http', '$q', 'Jira', 'Confluence', 'Github', 'User',
    function ($http, $q, Jira, Confluence, Github, User) {

        this.releaseVersion = function (currentVersion, newVersion, prerelease) {
            var fecs;
            return Github.commitAndTagVersion(currentVersion, newVersion)
                .then(function (success) {
                    if (success) {
                        return Github.getCommitsSinceLastRelease();
                    } else {
                        throw new Error();
                    }
                })
                .then(function (commits) {
                    if (commits) {
                        fecs = _extractFECs(commits);
                        if (fecs.withKeys.length > 0) {
                            return Jira.getIssues(fecs.withKeys);
                        }
                        else {
                            return null;
                        }
                    } else {
                        throw new Error();
                    }
                })
                .then(function (jiras) {
                    var titles = _extractTitles(jiras);
                    titles = titles.concat(fecs.withOutKeys);
                    return Github.createReleaseNotes(newVersion, titles, prerelease);
                })
                .then(function (release) {
                    if (release) {
                        return Jira.changeAssignee(fecs.withKeys);
                    }
                    else {
                        throw new Error();
                    }
                })
                .then(function (results) {
                    _.forEach(results, function (result) {
                        if (!result) {
                            throw new Error();
                        }
                    });
                    return Jira.changeStatuses(fecs.withKeys);
                })
                .then(function (results) {
                    //TODO: Confluence page
                    //TODO: Send mail?
                });
        };

        function _extractTitles(jiras) {
            var titles = [];
            if (jiras) {
                for (var i = 0; i < jiras.length; i++) {
                    var jira = jiras[i];
                    titles.push(jira.fields.summary);
                }
            }
            return titles;
        }

        function _extractFECs(commits) {
            var keys = {withKeys: [], withOutKeys: []};
            for (var i = 0; i < commits.length; i++) {
                var commit = commits[i];
                var msg = commit.commit.message;
                var regexp = /[A-Z]{3}-[0-9]{4}/g;
                var keys_results = msg.match(regexp);
                if (keys_results && keys_results.length) {
                    for (var j = 0; j < keys_results.length; j++) {
                        if (_.indexOf(keys.withKeys, keys_results[j]) === -1) {
                            keys.withKeys.push(keys_results[j]);
                        }
                    }
                }
                else {
                    var lines = msg.split('\n');
                    keys.withOutKeys.push(lines[0]);
                }
            }
            return keys;
        }
    }]);