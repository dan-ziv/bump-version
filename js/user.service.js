app.service('User', ['$http', '$q', function ($http, $q) {

    var _name = "Dan Ziv";
    var _email = "dan.ziv@kaltura.com";
    var _oauth_token = "3e9adbb2831794e061f87dd299aa795785f1d511";

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