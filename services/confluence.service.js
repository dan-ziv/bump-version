app.service('Confluence', ['$http', '$q', function ($http, $q) {

    var _apiPrefix = "https://kaltura.atlassian.net/wiki/rest/api";
    var _space = "FEC";
    var _user = null;
    var _playerV2pageId = "51119129";

    this.setCurrentUser = function () {
        return _doSetCurrentUser()
            .then(function (user) {
                if (user) {
                    _user = user;
                }
                return user;
            });
    };

    this.createPage = function (version) {
        return _getPageChild(_playerV2pageId, version, 0, 25)
            .then(function (child) {
                if (child) {
                    return _createPage(child, version);
                }
            });
    };

    function _doSetCurrentUser() {
        var deferred = $q.defer();

        $http.get(_apiPrefix + "/user/current")
            .then(function (response) {
                deferred.resolve(response.data);
            })
            .catch(function (e) {
                deferred.resolve(null);
            });

        return deferred.promise;
    }

    function _getPageChild(pageId, version, start, limit) {
        var deferred = $q.defer();

        $http.get(_apiPrefix + "/content/" + pageId + "/child/page?expand=page" +
            "&start=" + start + "&limit=" + limit)
            .then(function (response) {
                var children = response.data.results;
                if (!children.length) {
                    deferred.resolve(null);
                }
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (("v" + version).includes(child.title)) {
                        deferred.resolve(child);
                    }
                }
                deferred.resolve(_getPageChild(pageId, version, limit, limit + 25));
            })
            .catch(function (e) {
                deferred.resolve(null);
            });

        return deferred.promise;
    }

    function _createPage(parent, version) {
        debugger;
        var deferred = $q.defer();

        $http.post("https://kaltura.atlassian.net/wiki/rest/api/content", {
            "type": "page",
            //Create a new page as a child of another page
            "ancestors": [{
                "id": parent.id
            }],
            "title": "HTML5 v" + version,
            "space": {
                "key": _space
            },
            "body": {
                "storage": {
                    "value": "<p>This is a new page</p>",
                    "representation": "storage"
                }
            }
        }).then(function (response) {
            debugger;
            deferred.resolve(response.data);
        }).catch(function (e) {
            debugger;
            deferred.resolve(null);
        });

        return deferred.promise;
    }

}]);

