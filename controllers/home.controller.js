app.controller('homeController', ['$scope', '$timeout', '$location', 'User',
    function ($scope, $timeout, $location, User) {

        var _reviewSteps, _prerelease;

        (function () {
            firebase.database().ref('/version').once('value')
                .then(function (snapshot) {
                    $timeout(function () {
                        $scope.control.isAuthenticated = true;
                        $scope.control.user = {name: User.getName(), avatar: User.getAvatar()};
                        $scope.currentVersion = snapshot.val();
                        $scope.onPreReleaseChange();
                    }, 0);
                });
        })();

        $scope.onReviewStepsChange = function (reviewSteps) {
            _reviewSteps = reviewSteps;
        };

        $scope.onPreReleaseChange = function (prerelease) {
            _prerelease = prerelease;
            var currentVersion = $scope.currentVersion;
            var parts = currentVersion.split('.');
            var nextNum = parts[1];
            var nextRc = parts[2];
            if (_prerelease) {
                if (nextRc) {
                    var rcParts = nextRc.split('rc');
                    var nextRcVersion = rcParts[1];
                    nextRcVersion++;
                    $scope.nextVersion = parts[0] + '.' + nextNum + '.rc' + nextRcVersion;
                }
                else {
                    nextRc = 'rc1';
                    nextNum++;
                    $scope.nextVersion = parts[0] + '.' + nextNum + '.' + nextRc;
                }
            }
            else {
                $scope.nextVersion = parts[0] + '.' + nextNum;
            }
        };

        $scope.onCreateVersionClicked = function () {
            if (_reviewSteps) {
                $location.path('/commit').search({
                    currentVersion: $scope.currentVersion,
                    newVersion: $scope.nextVersion,
                    prerelease: _prerelease
                });
            }
            else {
                $location.path('/all-in-one').search({
                    currentVersion: $scope.currentVersion,
                    newVersion: $scope.nextVersion,
                    prerelease: _prerelease
                });
            }
        };
    }]);