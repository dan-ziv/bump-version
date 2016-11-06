app.controller('releaseNotesGitHubController', ['$scope', '$location', '$timeout', '$routeParams', 'GitHub',
    function ($scope, $location, $timeout, $routeParams, GitHub) {

        $scope.btnTxt = "Create Release Notes";
        $scope.loadingPage = true;
        $scope.inCreatePageProcess = false;
        $scope.title = 'v' + $scope.global.newVersion;

        (function () {
            GitHub.getNewReleaseCommitsUnified()
                .then(function (commits) {
                    $scope.commits = commits;
                })
                .catch(function (e) {

                })
                .finally(function () {
                    $scope.loadingPage = false;
                });
        })();

        $scope.onCreateNotesClicked = function () {
            if ($scope.btnTxt === "Create Release Notes") {
                $scope.btnTxt = "Creating Notes...";
                $scope.inCreatePageProcess = true;
                GitHub.createReleaseNotes($scope.global.newVersion, $scope.commits, $scope.global.prerelease)
                    .then(function (release) {
                        $scope.btnTxt = "Next";
                        $scope.html_url = release.html_url;
                    })
                    .catch(function (e) {
                        $scope.btnTxt = "Close";
                        $scope.errMsg = e.data.message;
                    })
                    .finally(function () {
                        $scope.inCreatePageProcess = false;
                    });
            } else if ($scope.btnTxt === "Next") {
                $location.path('/release-notes-confluence');
            } else if ($scope.btnTxt === "Close") {
                window.close();
            }
        };

        $scope.skip = function () {
            $location.path('/edit-tickets');
        };

        $scope.back = function () {
            $location.path('/release-notes-confluence');
        };
    }]);