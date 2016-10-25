app.controller('releaseNotesGithubController', ['$scope', '$location', '$timeout', '$routeParams', 'GitHub',
    function ($scope, $location, $timeout, $routeParams, GitHub) {

        $scope.btnTxt = "Create Release Notes";
        $scope.loadingPage = true;
        $scope.inCreateNotesProcess = false;
        $scope.title = 'v' + $routeParams.newVersion;

        (function () {
            GitHub.getCommitsAsTitles()
                .then(function (commits) {
                    $scope.commits = commits;
                    $scope.loadingPage = false;
                });
        })();

        $scope.onCreateNotesClicked = function () {
            if ($scope.btnTxt === "Create Release Notes") {
                $scope.btnTxt = "Creating Notes...";
                $scope.inCreateNotesProcess = true;
                GitHub.createReleaseNotes($routeParams.newVersion, $scope.commits, $routeParams.prerelease)
                    .then(function (release) {
                        if (release) {
                            $scope.btnTxt = "Next";
                            $scope.link = release.html_url;
                            $scope.inCreateNotesProcess = false;
                        }
                    });
            } else {
                $location.path('/release-notes-confluence');
            }
        };
    }]);