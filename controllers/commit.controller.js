app.controller('commitController', ['$scope', '$location', '$timeout', '$routeParams', 'GitHub',
    function ($scope, $location, $timeout, $routeParams, GitHub) {

        $scope.btnTxt = "Commit";
        $scope.loadingPage = true;
        $scope.inCommitProcess = false;
        $scope.tag = 'v' + $routeParams.newVersion;

        (function () {
            GitHub.getCurrentBranch($routeParams.currentVersion)
                .then(function (branch) {
                    $scope.branch = branch;
                    $scope.path = GitHub.getFilePath();
                })
                .catch(function (e) {
                })
                .finally(function () {
                    $scope.loadingPage = false;
                });
        })();

        $scope.onCommitClicked = function () {
            if ($scope.btnTxt === "Commit") {
                $scope.btnTxt = "Committing...";
                $scope.inCommitProcess = true;
                GitHub.commitFile($routeParams.currentVersion, $routeParams.newVersion)
                    .then(function () {
                        $scope.btnTxt = "Next";
                    })
                    .catch(function (e) {
                        $scope.btnTxt = "Close";
                        $scope.errMsg = e.data.message;
                    })
                    .finally(function () {
                        $scope.inCommitProcess = false;
                    });
            } else if ($scope.btnTxt === "Next") {
                $location.path('/tag-repo');
            } else if ($scope.btnTxt === "Close") {
                window.close();
            }
        };
    }]);