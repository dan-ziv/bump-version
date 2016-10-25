app.controller('tagRepoController', ['$scope', '$location', '$timeout', '$routeParams', 'GitHub',
    function ($scope, $location, $timeout, $routeParams, GitHub) {

        $scope.btnTxt = "Tag";
        $scope.loadingPage = true;
        $scope.inTagProcess = false;
        $scope.tag = 'v' + $routeParams.newVersion;

        (function () {
            GitHub.getCurrentBranch($routeParams.currentVersion)
                .then(function (branch) {
                    $scope.branch = branch;
                    $scope.loadingPage = false;
                });
        })();

        $scope.onTagClicked = function () {
            if ($scope.btnTxt === "Tag") {
                $scope.btnTxt = "Tagging...";
                $scope.inTagProcess = true;
                GitHub.tagRepository($routeParams.newVersion)
                    .then(function (success) {
                        if (success) {
                            $scope.btnTxt = "Next";
                            $scope.inTagProcess = false;
                        }
                    });
            } else {
                $location.path('/release-notes-github');
            }
        };
    }]);