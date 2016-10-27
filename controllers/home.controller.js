app.controller('homeController', ['$scope', '$timeout', '$location', 'User', 'GitHub',
    function ($scope, $timeout, $location, User, GitHub) {

        var _auto, _prerelease;
        $scope.loadingPage = true;

        (function () {
            firebase.database().ref('/version').once('value')
                .then(function (snapshot) {
                    $timeout(function () {
                        $scope.control.isAuthenticated = true;
                        $scope.control.user = {name: User.getName(), avatar: User.getAvatar()};
                        $scope.currentVersion = snapshot.val();
                        $scope.repo = GitHub.getFullRepositoryName();
                        $scope.onPreReleaseChange();
                        $scope.loadingPage = false;
                    }, 0);
                });
        })();

        $scope.onAutoChange = function (auto) {
            _auto = auto;
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
            if (_auto) {
                $location.path('/all-in-one').search({
                    currentVersion: $scope.currentVersion,
                    newVersion: $scope.nextVersion,
                    prerelease: _prerelease
                });
            }
            else {
                $location.path('/commit').search({
                    currentVersion: $scope.currentVersion,
                    newVersion: $scope.nextVersion,
                    prerelease: _prerelease
                });
            }
        };
    }]);