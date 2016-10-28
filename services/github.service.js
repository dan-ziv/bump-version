app.service('GitHub', ['$http', '$q', 'User', 'Jira',
    function ($http, $q, User, Jira) {

        var _apiPrefix = 'https://api.github.com';
        var _owner = null;
        var _repo = null;
        var _branch = null;
        var _defaultSettingsFilePath = 'DefaultSettings.php';
        var _statuses = ["CLOSED", "READY FOR QA", "DEPLOYED"];

        this.getCurrentVersion = function () {
            return _doGetFileContents()
                .then(function (contents) {
                    var content = contents.content;
                    var lines = content.split('\n');
                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i];
                        if (line.startsWith("$wgMwEmbedVersion")) {
                            var parts = line.split('=');
                            return _extractVersion(parts[1]);
                        }
                    }
                });
        };

        this.setRepository = function (repo) {
            var parts = repo.split('/');
            _owner = parts[0];
            _repo = parts[1];
        };

        this.setBranch = function (branch) {
            _branch = branch;
        };

        this.tagRepository = function (newVersion) {
            return _tagRepository(newVersion);
        };

        this.commitFile = function (newVersion) {
            return _updateFile(newVersion);
        };

        this.getUserRepositories = function () {
            return _doGetUserRepositories();
        };

        this.getRepositoryBranches = function (repo) {
            return _doGetRepositoryBranches(repo);
        };

        this.createReleaseNotes = function (tag, titles, prerelease) {
            var body = "";
            for (var i = 0; i < titles.length; i++) {
                var title = titles[i];
                var status = _containsAnyStatus(title);
                if (status) {
                    title = titles.replace(status, "");
                }
                body += "* " + title + "\n";
            }
            return _doCreateReleaseNotes(tag, body, prerelease);
        };

        this.getNewReleaseCommitsSplitted = function () {
            return this.getCommitsSinceLastRelease()
                .then(function (commits) {
                    return _splitToJiraAndNonJira(commits);
                });
        };

        this.getNewReleaseCommitsUnified = function () {
            return this.getCommitsSinceLastRelease()
                .then(function (commits) {
                    var newRelease = _splitToJiraAndNonJira(commits);
                    if (newRelease.withJiraTicket.length > 0) {
                        return Jira.getIssues(newRelease.withJiraTicket)
                            .then(function (jiras) {
                                var titles = _extractTitlesFromJira(jiras);
                                return titles.concat(newRelease.withOutJiraTicket);
                            });
                    }
                    else {
                        return newRelease.withOutJiraTicket;
                    }
                });
        };

        this.getFilePath = function () {
            return _defaultSettingsFilePath;
        };

        // this.getAllBranches = function (from) {
        //     var that = this;
        //     return _doListBranches(from)
        //         .then(function (branches) {
        //             if (branches.length > 0) {
        //                 for (var i = 0; i < branches.length; i++) {
        //                     var branch = branches[i];
        //                     _branches.push(branch.name);
        //                 }
        //                 return that.getAllBranches(from + 1);
        //             }
        //             else {
        //                 return _branches;
        //             }
        //         });
        // };

        this.getCommitsSinceLastRelease = function () {
            return _doGetCommits()
                .then(function (commits) {
                    for (var i = 1; i < commits.length; i++) {
                        var commit = commits[i];
                        var msg = commit.commit.message.toLowerCase();
                        if (msg.includes("bump")) {
                            return commits.slice(1, i);
                        }
                    }
                    return [];
                });
        };

        function _extractVersion(s) {
            s = s.replace(";", "");
            s = s.trim();
            return s.substring(1, s.length - 1);
        }

        function _doGetRepositoryBranches(repo) {
            var deferred = $q.defer();

            $http.get(_apiPrefix + '/repos/' + repo + '/branches?access_token=' + User.getOAuthToken() + '&per_page=1000')
                .then(function (response) {
                    deferred.resolve(response.data);
                })
                .catch(function (e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        }

        function _doGetUserRepositories() {
            var deferred = $q.defer();

            $http.get(_apiPrefix + '/user/repos?access_token=' + User.getOAuthToken()
                + '&affiliation=collaborator,organization_member&per_page=1000')
                .then(function (response) {
                    deferred.resolve(response.data);
                })
                .catch(function (e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        }

        function _extractTitlesFromJira(jiras) {
            var titles = [];
            if (jiras) {
                for (var i = 0; i < jiras.length; i++) {
                    var jira = jiras[i];
                    titles.push(jira.fields.summary);
                }
            }
            return titles;
        }

        function _splitToJiraAndNonJira(commits) {
            var newRelease = {withJiraTicket: [], withOutJiraTicket: []};
            for (var i = 0; i < commits.length; i++) {
                var commit = commits[i];
                var msg = commit.commit.message;
                var regexp = /[A-Z]{3}-[0-9]{4}/g;
                var keys_results = msg.match(regexp);
                if (keys_results && keys_results.length) {
                    for (var j = 0; j < keys_results.length; j++) {
                        if (_.indexOf(newRelease.withJiraTicket, keys_results[j]) === -1) {
                            newRelease.withJiraTicket.push(keys_results[j]);
                        }
                    }
                }
                else {
                    var lines = msg.split('\n');
                    newRelease.withOutJiraTicket.push(lines[0]);
                }
            }
            return newRelease;
        }

        function _getCurrentBranch(version, page) {
            var splitVersion = version.split('.');
            var branchPrefix = splitVersion[0] + '.' + splitVersion[1];
            return _doListBranches(page)
                .then(function (branches) {
                    if (branches.length > 0) {
                        for (var i = 0; i < branches.length; i++) {
                            var branch = branches[i];
                            if (branch.name.startsWith(branchPrefix)) {
                                return branch.name;
                            }
                        }
                        return _getCurrentBranch(version, page + 1);
                    }
                    else {
                        return null;
                    }
                });
        }

        function _doListBranches(page) {
            var deferred = $q.defer();

            $http.get(_apiPrefix + '/repos/' + _owner + '/' + _repo + '/branches?page=' + page)
                .then(function (response) {
                    deferred.resolve(response.data);
                })
                .catch(function (e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        }

        function _containsAnyStatus(title) {
            for (var i = 0; i < _statuses.length; i++) {
                var status = _statuses[i];
                if (title.indexOf(status) != -1) {
                    return status;
                }
            }
            return null;
        }

        function _doCreateReleaseNotes(tag, body, prerelease) {
            var deferred = $q.defer();

            $http.post(_apiPrefix + '/repos/' + _owner + '/' + _repo + '/releases?access_token=' + User.getOAuthToken(), {
                "tag_name": "v" + tag,
                "target_commitish": _branch,
                "name": "v" + tag,
                "body": body,
                "draft": false,
                "prerelease": prerelease
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (e) {
                deferred.reject(e);
            });

            return deferred.promise;
        }

        function _doGetCommits() {
            var deferred = $q.defer();

            $http.get(_apiPrefix + '/repos/' + _owner + '/' + _repo + '/commits?sha=' + _branch)
                .then(function (response) {
                    deferred.resolve(response.data);
                })
                .catch(function (e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        }

        function _updateFile(newVersion) {
            return _doGetFileContents()
                .then(function (contents) {
                    var oldMwEmbedVersion = null;
                    var content = contents.content;
                    var lines = content.split('\n');
                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i];
                        if (line.startsWith("$wgMwEmbedVersion")) {
                            oldMwEmbedVersion = line;
                            break;
                        }
                    }
                    var newMwEmbedVersion = "$wgMwEmbedVersion = '" + newVersion + "';";
                    contents.content = btoa(contents.content.replace(oldMwEmbedVersion, newMwEmbedVersion));
                    return _doCommitFile(contents, newVersion);
                });
        }

        function _doGetFileContents() {
            var deferred = $q.defer();

            $http.get(_apiPrefix + '/repos/' + _owner + '/' + _repo + '/contents/' + _defaultSettingsFilePath + '?ref=' + _branch)
                .then(function (response) {
                    deferred.resolve({sha: response.data.sha, content: atob(response.data.content)});
                })
                .catch(function (e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        }

        function _doCommitFile(contents, nextVersion) {
            var deferred = $q.defer();

            $http.put(_apiPrefix + '/repos/' + _owner + '/' + _repo +
                '/contents/' + _defaultSettingsFilePath + '?access_token=' + User.getOAuthToken(), {
                "message": "Bump version to " + nextVersion,
                "content": contents.content,
                "sha": contents.sha,
                "branch": _branch
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (e) {
                deferred.reject(e);
            });

            return deferred.promise;
        }

        function _tagRepository(tagVersion) {
            return _doGetReference()
                .then(function (response) {
                    return _doCreateTag(response.object.sha, tagVersion)
                        .then(function (response) {
                            return _doCreateReference(response.sha, response.tag);
                        });
                });
        }

        function _doGetReference() {
            var deferred = $q.defer();

            $http.get(_apiPrefix + '/repos/' + _owner + '/' + _repo + '/git/refs/heads/' + _branch)
                .then(function (response) {
                    deferred.resolve(response.data);
                })
                .catch(function (e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        }

        function _doCreateTag(sha, tagVersion) {
            var deferred = $q.defer();

            $http.post(_apiPrefix + '/repos/' + _owner + '/' + _repo + '/git/tags' + "?access_token=" + User.getOAuthToken(), {
                "tag": "v" + tagVersion,
                "message": "v" + tagVersion,
                "object": sha,
                "type": "commit",
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (e) {
                deferred.reject(e);
            });

            return deferred.promise;
        }

        function _doCreateReference(sha, tag) {
            var deferred = $q.defer();

            $http.post(_apiPrefix + '/repos/' + _owner + '/' + _repo + '/git/refs' + "?access_token=" + User.getOAuthToken(), {
                "ref": "refs/tags/" + tag,
                "sha": sha
            }).then(function (response) {
                deferred.resolve(response.data);
            }).catch(function (e) {
                deferred.reject(e);
            });

            return deferred.promise;
        }
    }]);