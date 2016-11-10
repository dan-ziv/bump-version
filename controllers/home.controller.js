app.controller('homeController', ['$scope', '$timeout', '$location', '$q', 'User', 'GitHub',
    function ($scope, $timeout, $location, $q, User, GitHub) {

        $scope.loadingPage = true;
        $scope.global.isAuthenticated = true;
        $scope.global.user = {name: User.getName(), avatar: User.getAvatar()};
        $scope.repos = null;
        $scope.branches = null;

        loadRepositories().then(function (repos) {
            $scope.repos = repos;
            $scope.loadingPage = false;
        });

        function loadRepositories() {
            var promise = $q.defer();

            if ($scope.repos) {
                promise.resolve($scope.repos);
            } else {
                GitHub.getUserRepositories()
                    .then(function (repos) {
                        promise.resolve(repos);
                    });
            }

            return promise.promise;
        }

        $scope.selectedRepoChange = function (repo) {
            if (repo) {
                $scope.currentVersion = null;
                loadBranches(repo.full_name);
            }
        };

        $scope.selectedBranchChange = function (branch) {
            if (branch) {
                getCurrentVersion();
            }
        };

        function loadBranches(repo) {
            GitHub.getRepositoryBranches(repo)
                .then(function (branches) {
                    $scope.branches = branches;
                });
        }

        $scope.queryRepoSearch = function (query) {
            var deferred = $q.defer();
            if ($scope.repos) {
                var results = query ? $scope.repos.filter(createFilterForRepo(query)) : $scope.repos;
                $timeout(function () {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
            }
            else {
                deferred.resolve([]);
            }
            return deferred.promise;
        };

        $scope.queryBranchSearch = function (query) {
            var deferred = $q.defer();
            if ($scope.branches) {
                var results = query ? $scope.branches.filter(createFilterForBranch(query)) : $scope.branches;
                $timeout(function () {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
            }
            else {
                deferred.resolve([]);
            }
            return deferred.promise;
        };

        function createFilterForRepo(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(repo) {
                var lowercaseName = angular.lowercase(repo.full_name);
                return (lowercaseName.indexOf(lowercaseQuery) !== -1);
            };
        }

        function createFilterForBranch(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(branch) {
                var lowercaseName = angular.lowercase(branch.name);
                return (lowercaseName.indexOf(lowercaseQuery) !== -1);
            };
        }

        function getCurrentVersion() {
            GitHub.setRepository($scope.global.repo.full_name);
            GitHub.setBranch($scope.global.branch.name);
            GitHub.getCurrentVersion()
                .then(function (currentVersion) {
                    $scope.currentVersion = currentVersion;
                });
        }

        $scope.onVersionTypeChanged = function () {
            if (this.newVersionType === "Auto") {
                var that = this;
                that.detecting = true;
                $timeout(function () {
                    that.onPreReleaseChange();
                    that.detecting = false;
                }, 400);
            }
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
                if (!nextRc) {
                    nextNum++;
                    $scope.global.newVersion = parts[0] + '.' + nextNum;
                }
                else {
                    $scope.global.newVersion = parts[0] + '.' + nextNum;
                }
                nextNum--;
                $scope.global.lastOfficialVersion = parts[0] + '.' + nextNum;
            }
        };

        $scope.onCreateVersionClicked = function () {
            if ($scope.global.repo && $scope.global.branch && $scope.global.newVersion) {
                $location.path('/commit');
            }
        };
    }]);