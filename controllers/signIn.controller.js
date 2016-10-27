app.controller('signInController', ['$scope', '$timeout', '$location', 'User',
    function ($scope, $timeout, $location, User) {
        $scope.signIn = function () {
            User.authenticate().then(function (success) {
                if (success) {
                    $location.path('/home');
                }
            });
        };
    }]);