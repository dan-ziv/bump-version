app.controller('releaseNotesConfluenceController', ['$scope', '$location', '$timeout', '$routeParams', 'GitHub',
    function ($scope, $location, $timeout, $routeParams, GitHub) {

        $scope.btnTxt = "Create Page";
        $scope.loadingPage = true;
        $scope.inCreatePageProcess = false;
        $scope.pageData = {
            title: 'HTML5 v' + $scope.global.newVersion,
            subTitle: 'HTML5 Release notes for version: v' + $scope.global.newVersion,
            versionSummary: {content: true, fixedBugs: true, newFeatures: false},
            importantToKnow: "",
            knownIssues: "",
            preSanityTests: ""
        };

        (function () {
            GitHub.getNewReleaseCommitsSplitted()
                .then(function (commits) {
                    $scope.notes = commits.withJiraTicket.concat(commits.withOutJiraTicket);
                })
                .catch(function (e) {
                })
                .finally(function () {
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

        $scope.skip = function () {
            $location.path('/change-statuses');
        };

        $scope.back = function () {
            $location.path('/release-notes-github');
        };
    }]);