app.service('Jira', ['$http', '$q', function ($http, $q) {

    var _apiPrefix = 'https://kaltura.atlassian.net/rest/api';
    var _qaAssignee = 'alexs';
    var _readyForQA = 'Ready for QA';
    // var _qaAssignee = 'yair.ansbacher';
    // var _readyForQA = 'Start work (Dev)';

    this.changeStatuses = function (issues) {
        var deferred = $q.defer();
        var promises = [];

        _.forEach(issues, function (issue) {
            promises.push(_changeStatus(issue));
        });

        $q.all(promises).then(function (results) {
            deferred.resolve(results);
        });

        return deferred.promise;
    };

    this.changeAssignee = function (issues) {
        var deferred = $q.defer();
        var promises = [];

        _.forEach(issues, function (issue) {
            promises.push(_doAssignee(issue, _qaAssignee));
        });

        $q.all(promises).then(function (jiras) {
            deferred.resolve(jiras);
        });

        return deferred.promise;
    };

    this.getIssues = function (issues) {
        var deferred = $q.defer();
        var promises = [];

        _.forEach(issues, function (issue) {
            promises.push(_doGetIssue(issue));
        });

        $q.all(promises).then(function (jiras) {
            deferred.resolve(jiras);
        });

        return deferred.promise;
    };

    function _doGetIssue(issue) {
        var deferred = $q.defer();

        $http.get(_apiPrefix + '/2/issue/' + issue)
            .then(function (response) {
                deferred.resolve(response.data);
            })
            .catch(function (e) {
                deferred.resolve(null);
            });

        return deferred.promise;
    }

    function _doGetTransitions(issue) {
        var deferred = $q.defer();

        $http.get(_apiPrefix + '/2/issue/' + issue + '/transitions')
            .then(function (response) {
                deferred.resolve(response.data.transitions);
            })
            .catch(function (e) {
                deferred.resolve(null);
            });

        return deferred.promise;
    }

    function _doTransition(issue, id) {
        var deferred = $q.defer();

        $http.post(_apiPrefix + '/2/issue/' + issue + '/transitions', {
            "transition": {
                "id": id
            }
        }).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (e) {
            deferred.resolve(null);
        });

        return deferred.promise;
    }

    function _doAssignee(issue, assignee) {
        var deferred = $q.defer();

        $http.put(_apiPrefix + '/2/issue/' + issue + '/assignee', {
            "name": assignee
        }).then(function (response) {
            deferred.resolve(response.data);
        }).catch(function (e) {
            deferred.resolve(null);
        });

        return deferred.promise;
    }

    function _changeStatus(issue) {
        return _doGetTransitions(issue)
            .then(function (transitions) {
                for (var i = 0; i < transitions.length; i++) {
                    var transition = transitions[i];
                    if (transition.name === _readyForQA) {
                        return _doTransition(issue, transition.id);
                    }
                }
            });
    }
}]);