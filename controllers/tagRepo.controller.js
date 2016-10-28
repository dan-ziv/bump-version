app.controller('tagRepoController', ['$scope', '$location', '$timeout', 'GitHub',
    function ($scope, $location, $timeout, GitHub) {

        $scope.btnTxt = "Tag";
        $scope.inTagProcess = false;
        $scope.tag = 'v' + $scope.global.newVersion;
        $scope.loadingPage = false;

        $scope.onTagClicked = function () {
            if ($scope.btnTxt === "Tag") {
                $scope.btnTxt = "Tagging...";
                $scope.inTagProcess = true;
                GitHub.tagRepository($scope.global.newVersion)
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

        $scope.skip = function () {
            $location.path('/release-notes-github');
        };

        $scope.back = function () {
            $location.path('/commit');
        };
    }]);