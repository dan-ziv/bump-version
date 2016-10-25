app.controller('commitController', ['$scope', '$location', '$timeout', '$routeParams', 'GitHub',
    function ($scope, $location, $timeout, $routeParams, GitHub) {

        $scope.btnTxt = "Commit";
        $scope.loadingPage = true;
        $scope.inCommitProcess = false;
        $scope.line = 'v' + $routeParams.newVersion;

        (function () {
            GitHub.getCurrentBranch($routeParams.currentVersion)
                .then(function (branch) {
                    $scope.branch = branch;
                    $scope.path = GitHub.getFilePath();
                    $scope.loadingPage = false;
                });
        })();

        $scope.onCommitClicked = function () {
            if ($scope.btnTxt === "Commit") {
                $scope.btnTxt = "Committing...";
                $scope.inCommitProcess = true;
                GitHub.commitFile($routeParams.currentVersion, $routeParams.newVersion)
                    .then(function (success) {
                        if (success) {
                            $scope.btnTxt = "Next";
                            $scope.inCommitProcess = false;
                        }
                    });
            } else {
                $location.path('/tag-repo');
            }
        };
    }]);