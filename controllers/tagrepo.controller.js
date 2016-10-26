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
                })
                .catch(function (e) {
                })
                .finally(function () {
                    $scope.loadingPage = false;
                });
        })();

        $scope.onTagClicked = function () {
            if ($scope.btnTxt === "Tag") {
                $scope.btnTxt = "Tagging...";
                $scope.inTagProcess = true;
                GitHub.tagRepository($routeParams.newVersion)
                    .then(function () {
                        $scope.btnTxt = "Next";
                    })
                    .catch(function (e) {
                        $scope.btnTxt = "Close";
                        $scope.errMsg = e.data.message;
                    })
                    .finally(function () {
                        $scope.inTagProcess = false;
                    });
            } else if ($scope.btnTxt === "Next") {
                $location.path('/release-notes-github');
            } else if ($scope.btnTxt === "Close") {
                window.close();
            }
        };
    }]);