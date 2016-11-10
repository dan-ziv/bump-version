app.controller('releaseNotesConfluenceController', ['$scope', '$location', '$timeout', 'Confluence', 'GitHub',
    function ($scope, $location, $timeout, Confluence, GitHub) {

        $scope.btnTxt = "Create Page";
        $scope.loadingPage = true;
        $scope.inCreatePageProcess = false;
        $scope.pageData = {
            newVersion: $scope.global.newVersion,
            title: 'HTML5 v' + $scope.global.newVersion,
            subTitle: 'HTML5 Release notes for version: v' + $scope.global.newVersion,
            versionSummary: {content: true, fixedBugs: true, newFeatures: false},
            importantToKnow: "",
            knownIssues: "",
            preSanityTests: "",
            libTestUrl: 'http://kgit.html5video.org/tags/v' + $scope.global.newVersion + '/mwEmbedLoader.php',
            githubUrl: 'https://github.com/kaltura/mwEmbed/releases/tag/v' + $scope.global.newVersion,
            issues: {withJiraTicket: [], withOutJiraTicket: []}
        };

        (function () {
            var releaseInfo = {
                prerelease: $scope.global.prerelease,
                lastOfficialVersion: $scope.global.lastOfficialVersion
            };
            GitHub.getNewReleaseCommitsSplitted(releaseInfo)
                .then(function (commits) {
                    $scope.pageData.issues.withJiraTicket = commits.withJiraTicket;
                    $scope.pageData.issues.withOutJiraTicket = commits.withOutJiraTicket;
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

                $scope.pageData.versionSummary.content = $scope.pageData.versionSummary.content ? 'complete' : 'incomplete';
                $scope.pageData.versionSummary.fixedBugs = $scope.pageData.versionSummary.fixedBugs ? 'complete' : 'incomplete';
                $scope.pageData.versionSummary.newFeatures = $scope.pageData.versionSummary.newFeatures ? 'complete' : 'incomplete';

                Confluence.createPage($scope.pageData)
                    .then(function () {
                        $scope.btnTxt = "Next";
                    })
                    .catch(function (e) {
                        $scope.btnTxt = "Close";
                        $scope.errMsg = e.data.message;
                    })
                    .finally(function () {
                        $scope.inCreatePageProcess = false;
                    });

            } else if ($scope.btnTxt === "Next") {
                $location.path('/release-notes-github');
            } else if ($scope.btnTxt === "Close") {
                window.close();
            }
        };

        $scope.skip = function () {
            $location.path('/release-notes-github');
        };

        $scope.back = function () {
            $location.path('/tag-repo');
        };
    }]);