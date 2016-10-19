app.service('User', ['$http', '$q', function ($http, $q) {

    var _name = "YOUR_NAME";
    var _email = "YOUR_NAME";
    var _oauth_token = "YOUR_ACCESS_TOKEN";

    this.getName = function () {
        return _name;
    };

    this.getEmail = function () {
        return _email;
    };

    this.getOAuthToken = function () {
        return _oauth_token;
    };
}]);
