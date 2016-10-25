app.controller('tagRepoController', ['$scope', '$location', '$timeout', '$routeParams', 'Github',
    function ($scope, $location, $timeout, $routeParams, Github) {

        $scope.btnTxt = "Tag";
        $scope.loadingPage = true;
        $scope.inTagProcess = false;
        $scope.tag = 'v' + $routeParams.newVersion;

        (function () {
            Github.getCurrentBranch($routeParams.currentVersion)
                .then(function (branch) {
                    $scope.branch = branch;
                    $scope.loadingPage = false;
                });
        })();

        $scope.onTagClicked = function () {
            if ($scope.btnTxt === "Tag") {
                $scope.btnTxt = "Tagging...";
                $scope.inTagProcess = true;
                $timeout(function () {
                    $scope.btnTxt = "Next";
                    $scope.inTagProcess = false;
                }, 2000);
            } else {
                $location.path('/release-notes-github');
            }
        };
    }]);