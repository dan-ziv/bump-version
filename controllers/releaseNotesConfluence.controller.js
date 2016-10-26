app.controller('releaseNotesConfluenceController', ['$scope', '$location', '$timeout', '$routeParams', 'GitHub',
    function ($scope, $location, $timeout, $routeParams, GitHub) {

        $scope.btnTxt = "Create Page";
        $scope.loadingPage = true;
        $scope.inCreatePageProcess = false;
        $scope.title = 'HTML5 v' + $routeParams.newVersion;
        $scope.subTitle = 'HTML5 Release notes for version: v' + $routeParams.newVersion;
        $scope.versionSummary = {content: true, fixedBugs: true, newFeatures: false};
        $scope.importantToKnow = "";
        $scope.knownIssues = "";
        $scope.preSanityTests = "";

        (function () {
            GitHub.getCommitsByKeys()
                .then(function (commits) {
                    $scope.notes = commits.withKeys.concat(commits.withOutKeys);
                    $scope.loadingPage = false;
                });
        })();

        $scope.onCreatePageClicked = function () {
            if ($scope.btnTxt === "Create Page") {
                $scope.btnTxt = "Creating Page...";
                $scope.inCreatePageProcess = true;
                $timeout(function () {
                    var result = true;
                    if (result) {
                        $scope.btnTxt = "Next";
                    } else {
                        $scope.btnTxt = "Close";
                    }
                    $scope.inCreatePageProcess = false;
                });
            } else if ($scope.btnTxt === "Next") {
                $location.path('/change-statuses');
            } else if ($scope.btnTxt === "Close") {
                window.close();
            }
        };
    }]);