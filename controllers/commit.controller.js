app.controller('commitController', ['$scope', '$location', '$timeout', '$routeParams', 'Github',
    function ($scope, $location, $timeout, $routeParams, Github) {

        $scope.btnTxt = "Commit";
        $scope.loadingPage = true;
        $scope.inCommitProcess = false;
        $scope.line = 'v' + $routeParams.newVersion;

        (function () {
            $scope.path = Github.getFilePath();
            $scope.loadingPage = false;
        })();

        $scope.onCommitClicked = function () {
            if ($scope.btnTxt === "Commit") {
                $scope.btnTxt = "Committing...";
                $scope.inCommitProcess = true;
                $timeout(function () {
                    $scope.btnTxt = "Next";
                    $scope.inCommitProcess = false;
                }, 2000);
            } else {
                $location.path('/tag-repo');
            }
        };
    }]);