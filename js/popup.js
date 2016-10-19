// Initialize Angular
var app = angular.module('releaseVersion', []);

app.controller('ReleaseVersionController', ['$scope', '$timeout', 'ReleaseFlowManager',
    function ($scope, $timeout, ReleaseFlowManager) {

        $scope.onPopupShown = function () {
            $scope.dataLoaded = false;
            return firebase.database().ref('/version').once('value')
                .then(function (snapshot) {
                    $timeout(function () {
                        $scope.currentVersion = snapshot.val();
                        $scope.onPreReleaseChange();
                        $scope.createClicked = false;
                        $scope.dataLoaded = true;
                    }, 0);
                });
        };

        $scope.onPreReleaseChange = function (prerelease) {
            $scope.prerelease = prerelease;
            var currentVersion = $scope.currentVersion;
            var parts = currentVersion.split('.');
            var nextNum = parts[1];
            var nextRc = parts[2];
            if (prerelease) {
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
            $timeout(function () {
                $scope.createClicked = true;
            }, 0);

            ReleaseFlowManager.releaseVersion($scope.currentVersion, $scope.nextVersion, $scope.prerelease);
        };
    }]);
