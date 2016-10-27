app.service('Confluence', ['$http', '$q', function ($http, $q) {

    var _apiPrefix = "https://kaltura.atlassian.net/wiki/rest/api";
    var _space = "FEC";
    var _playerV2PageID = "51119129";

    this.createPage = function (pageData) {
        return _getCurrentUser()
            .then(function (user) {
                return _getDirectParentPage(_playerV2PageID, pageData.version, 0, 25)
                    .then(function (directParent) {
                        return _createPage(directParent, user, pageData);
                    });
            });
    };

    function _getCurrentUser() {
        var deferred = $q.defer();

        $http.get(_apiPrefix + "/user/current")
            .then(function (response) {
                deferred.resolve(response.data);
            })
            .catch(function (e) {
                deferred.reject(e);
            });

        return deferred.promise;
    }

    function _getDirectParentPage(version, start, limit) {
        var deferred = $q.defer();

        $http.get(_apiPrefix + "/content/" + _playerV2PageID + "/child/page?expand=page" +
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
                deferred.resolve(_getDirectParentPage(version, limit, limit + 25));
            })
            .catch(function (e) {
                deferred.reject(e);
            });

        return deferred.promise;
    }

    function _createPage(directParent, user, pageData) {
        var deferred = $q.defer();

        $http.post(_apiPrefix + "/content", {
            "type": "page",
            //Create a new page as a child of another page
            "ancestors": [{
                "id": directParent.id
            }],
            "title": pageData.title,
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
            deferred.resolve(response.data);
        }).catch(function (e) {
            deferred.reject(e);
        });

        return deferred.promise;
    }

}]);

