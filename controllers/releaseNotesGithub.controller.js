app.controller('releaseNotesGitHubController', ['$scope', '$location', '$timeout', '$routeParams', 'GitHub',
    function ($scope, $location, $timeout, $routeParams, GitHub) {

        $scope.btnTxt = "Create Release Notes";
        $scope.loadingPage = true;
        $scope.inCreatePageProcess = false;
        $scope.title = 'v' + $routeParams.newVersion;

        (function () {
            GitHub.getCommitsAsTitles()
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
                GitHub.createReleaseNotes($routeParams.newVersion, $scope.commits, $routeParams.prerelease)
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
    }]);