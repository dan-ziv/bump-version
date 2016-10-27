app.controller('commitController', ['$scope', '$location', '$timeout', 'GitHub',
    function ($scope, $location, $timeout, GitHub) {

        (function () {
            // Entry to the release process
            $scope.global.inReleaseProcess = true;

            $scope.btnTxt = "Commit";
            $scope.inCommitProcess = false;
            $scope.path = GitHub.getFilePath();
            $scope.loadingPage = false;
        })();

        $scope.onCommitClicked = function () {
            if ($scope.btnTxt === "Commit") {
                $scope.btnTxt = "Committing...";
                $scope.inCommitProcess = true;
                GitHub.commitFile($scope.global.newVersion)
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