app.controller('homeController', ['$scope', '$timeout', '$location', 'User', 'GitHub',
    function ($scope, $timeout, $location, User, GitHub) {

        $scope.global.isAuthenticated = true;
        $scope.global.user = {name: User.getName(), avatar: User.getAvatar()};
        $scope.repos = null;
        $scope.branches = null;
        $scope.loadingPage = false;

        $scope.loadRepositories = function () {
            $scope.currentVersion = null;
            if (!$scope.repos) {
                GitHub.getUserRepositories()
                    .then(function (repos) {
                        $scope.repos = repos;
                    });
            }
        };

        $scope.loadBranches = function (repo) {
            GitHub.getRepositoryBranches(repo)
                .then(function (branches) {
                    $scope.branches = branches;
                });
        };

        $scope.getCurrentVersion = function () {
            var that = this;
            GitHub.setRepository($scope.global.repo);
            GitHub.setBranch($scope.global.branch);
            GitHub.getCurrentVersion()
                .then(function (currentVersion) {
                    $scope.currentVersion = currentVersion;
                    that.onPreReleaseChange();
                });
        };

        $scope.onPreReleaseChange = function () {
            var currentVersion = $scope.currentVersion;
            var parts = currentVersion.split('.');
            var nextNum = parts[1];
            var nextRc = parts[2];
            if ($scope.global.prerelease) {
                if (nextRc) {
                    if (nextRc.includes('rc')) {
                        var rcParts = nextRc.split('rc');
                        var nextRcVersion = rcParts[1];
                        nextRcVersion++;
                        $scope.global.newVersion = parts[0] + '.' + nextNum + '.rc' + nextRcVersion;
                    } else {
                        nextRc++;
                        $scope.global.newVersion = parts[0] + '.' + nextNum + '.' + nextRc;
                    }
                }
                else {
                    nextRc = 'rc1';
                    nextNum++;
                    $scope.global.newVersion = parts[0] + '.' + nextNum + '.' + nextRc;
                }
            }
            else {
                $scope.global.newVersion = parts[0] + '.' + nextNum;
            }
        };

        $scope.onCreateVersionClicked = function () {
            if ($scope.global.repo && $scope.global.branch && $scope.global.newVersion) {
                $location.path('/commit');
            }
        };
    }]);