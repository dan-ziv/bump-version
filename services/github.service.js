app.service('Github', ['$http', '$q', 'User', function ($http, $q, User) {

    var _apiPrefix = 'https://api.github.com';
    var _owner = "fecbot";
    // var _owner = "kaltura";
    var _repo = "fec-testing";
    // var _repo = "mwEmbed";
    var _branch = null;
    var _branches = [];
    // var _defaultSettingsFilePath = 'includes/DefaultSettings.php';
    var _defaultSettingsFilePath = 'DefaultSettings.php';
    var _statuses = ["CLOSED", "READY FOR QA", "DEPLOYED"];

    this.getFilePath = function () {
        return _defaultSettingsFilePath;
    };

    this.getCurrentBranch = function (currentVersion) {
        return _getCurrentBranch(currentVersion, 1);
    };

    this.tagRepository = function (newVersion) {
        return _tagRepository(newVersion);
    };

    this.commitFile = function (currentVersion, newVersion) {
        return _updateFile(currentVersion, newVersion);
    };

    this.getAllBranches = function (from) {
        var that = this;
        return _doListBranches(from)
            .then(function (branches) {
                if (branches.length > 0) {
                    for (var i = 0; i < branches.length; i++) {
                        var branch = branches[i];
                        _branches.push(branch.name);
                    }
                    return that.getAllBranches(from + 1);
                }
                else {
                    return _branches;
                }
            });
    };

    this.commitAndTagVersion = function (currentVersion, newVersion) {
        return _getCurrentBranch(currentVersion, 1)
            .then(function (branchName) {
                _branch = branchName || 'master';
                return _updateFile(currentVersion, newVersion)
                    .then(function (success) {
                        if (success) {
                            return _tagRepository(newVersion);
                        }
                        else {
                            return false;
                        }
                    });
            });
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
                return null;
            });
    };

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
                deferred.resolve(null);
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
            deferred.resolve(null);
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
                deferred.resolve(null);
            });

        return deferred.promise;
    }

    function _updateFile(currentVersion, newVersion) {
        return _doGetFileContents()
            .then(function (contents) {
                if (contents) {
                    // Change the version in the file
                    var oldMwEmbedVersion = "$wgMwEmbedVersion = '" + currentVersion + "'";
                    var newMwEmbedVersion = "$wgMwEmbedVersion = '" + newVersion + "'";
                    contents.content = btoa(contents.content.replace(oldMwEmbedVersion, newMwEmbedVersion));
                    return _doCommitFile(contents, newVersion)
                        .then(function (response) {
                            if (response) {
                                return true;
                            }
                        });
                }
            });
    }

    function _doGetFileContents() {
        var deferred = $q.defer();

        $http.get(_apiPrefix + '/repos/' + _owner + '/' + _repo + '/contents/' + _defaultSettingsFilePath + '?ref=' + _branch)
            .then(function (response) {
                deferred.resolve({sha: response.data.sha, content: atob(response.data.content)});
            })
            .catch(function (e) {
                deferred.resolve(null);
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
            // "committer": {
            //     "name": User.getName(),
            //     "email": User.getEmail()
            // },
            "branch": _branch
        }).then(function (response) {
            // Update current version to db
            return firebase.database().ref().update({'/version': nextVersion})
                .then(function () {
                    deferred.resolve(response.data);
                });
        }).catch(function (e) {
            deferred.resolve(null);
        });

        return deferred.promise;
    }

    function _tagRepository(tagVersion) {
        return _doGetReference()
            .then(function (response) {
                if (response) {
                    return _doCreateTag(response.object.sha, tagVersion)
                        .then(function (response) {
                            if (response) {
                                return _doCreateReference(response.sha, response.tag)
                                    .then(function (response) {
                                        if (response) {
                                            return true;
                                        }
                                    });
                            }
                        });
                }
            });
    }

    function _doGetReference() {
        var deferred = $q.defer();

        $http.get(_apiPrefix + '/repos/' + _owner + '/' + _repo + '/git/refs/heads/' + _branch)
            .then(function (response) {
                deferred.resolve(response.data);
            })
            .catch(function (e) {
                deferred.resolve(null);
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
            // "tagger": {
            //     "name": User.getName(),
            //     "email": User.getEmail()
            // }
        }).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (e) {
            deferred.resolve(null);
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
            deferred.resolve(null);
        });

        return deferred.promise;
    }
}]);