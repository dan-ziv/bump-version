app.service('User', ['$http', '$q', function ($http, $q) {

    var _avatar = null;
    var _name = null;
    var _access_token = null;
    var _clientId = '56e12bdbd085f4490628';
    var _clientSecret = 'e3585015e1fa42e7507c6c17f201ebdf7d6f0fdb';
    var _redirectUri = chrome.identity.getRedirectURL('github');
    var _redirectRe = new RegExp(_redirectUri + '[#\?](.*)');

    this.hasToken = function () {
        var deferred = $q.defer();

        if (localStorage['bumpVersion-accessToken']) {
            _access_token = localStorage['bumpVersion-accessToken'];
            _getUserInfo().then(function (user) {
                if (user) {
                    _name = user.name || '';
                    _avatar = user.avatar_url;
                    deferred.resolve(true);
                } else {
                    deferred.resolve(false);
                }
            });
        }
        else {
            deferred.resolve(false);
        }

        return deferred.promise;
    };

    this.authenticate = function () {
        var deferred = $q.defer();

        _fetchToken(true, function (error) {
            if (error) {
                deferred.resolve(false);
            } else {
                _getUserInfo().then(function (user) {
                    if (user) {
                        _name = user.name || '';
                        _avatar = user.avatar_url;
                        deferred.resolve(true);
                    } else {
                        deferred.resolve(false);
                    }
                });
            }
        });

        return deferred.promise;
    };

    this.getAvatar = function () {
        return _avatar;
    };

    this.getName = function () {
        return _name;
    };

    this.getOAuthToken = function () {
        return _access_token;
    };

    function _fetchToken(interactive, callback) {
        var options = {
            'interactive': interactive,
            'url': 'https://github.com/login/oauth/authorize' +
            '?client_id=' + _clientId +
            '&redirect_uri=' + encodeURIComponent(_redirectUri) +
            '&scope=repo user:email'
        };

        chrome.identity.launchWebAuthFlow(options, function (redirectUri) {
            console.log('launchWebAuthFlow completed', chrome.runtime.lastError,
                redirectUri);

            if (chrome.runtime.lastError) {
                callback(new Error(chrome.runtime.lastError));
                return;
            }

            var matches = redirectUri.match(_redirectRe);
            if (matches && matches.length > 1)
                handleProviderResponse(parseRedirectFragment(matches[1]));
            else
                callback(new Error('Invalid redirect URI'));
        });

        function parseRedirectFragment(fragment) {
            var pairs = fragment.split(/&/);
            var values = {};

            pairs.forEach(function (pair) {
                var nameval = pair.split(/=/);
                values[nameval[0]] = nameval[1];
            });

            return values;
        }

        function handleProviderResponse(values) {
            console.log('providerResponse', values);
            if (values.hasOwnProperty('access_token'))
                setAccessToken(values.access_token);
            else if (values.hasOwnProperty('code'))
                exchangeCodeForToken(values.code);
            else
                callback(new Error('Neither access_token nor code avialable.'));
        }

        function exchangeCodeForToken(code) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET',
                'https://github.com/login/oauth/access_token?' +
                'client_id=' + _clientId +
                '&client_secret=' + _clientSecret +
                '&redirect_uri=' + _redirectUri +
                '&code=' + code);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.onload = function () {
                if (this.status === 200) {
                    var response = JSON.parse(this.responseText);
                    console.log(response);
                    if (response.hasOwnProperty('access_token')) {
                        setAccessToken(response.access_token);
                    } else {
                        callback(new Error('Cannot obtain access_token from code.'));
                    }
                } else {
                    console.log('code exchange status:', this.status);
                    callback(new Error('Code exchange failed'));
                }
            };
            xhr.send();
        }

        function setAccessToken(token) {
            localStorage['bumpVersion-accessToken'] = token;
            _access_token = token;
            console.log('Setting access_token: ', _access_token);
            callback(null);
        }
    }

    function _getUserInfo() {
        var deferred = $q.defer();

        $http.get("https://api.github.com/user?access_token=" + _access_token)
            .then(function (response) {
                deferred.resolve(response.data);
            })
            .catch(function (e) {
                deferred.resolve(null);
            });

        return deferred.promise;
    }
}]);
