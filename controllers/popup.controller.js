// Initialize Angular
var app = angular.module('releaseVersion', ['ngMaterial', 'ngRoute'])
    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/home', {
                    templateUrl: 'home.html',
                    controller: 'homeController'
                })
                .when('/sign-in', {
                    templateUrl: 'sign-in.html',
                    controller: 'signInController'
                })
                .when('/all-in-one', {
                    templateUrl: 'all-in-one.html',
                    controller: 'allInOneController'
                })
                .when('/commit', {
                    templateUrl: '1-commit.html',
                    controller: 'commitController'
                })
                .when('/tag-repo', {
                    templateUrl: '2-tag.html',
                    controller: 'tagRepoController'
                })
                .when('/release-notes-github', {
                    templateUrl: '3-release-notes-github.html',
                    controller: 'releaseNotesGitHubController',
                })
                .when('/release-notes-confluence', {
                    templateUrl: '4-release-notes-confluence.html',
                    controller: 'releaseNotesConfluenceController',
                });
        }]);

app.controller('popupController', ['$scope', '$location', '$timeout', 'User',
    function ($scope, $location, $timeout, User) {

        $scope.control = {isAuthenticated: false, user: null};

        $scope.onPopupShown = function () {
            User.hasToken().then(function (hasToken) {
                if (hasToken) {
                    $location.path('/home');
                }
                else {
                    $location.path('/sign-in');
                }
            });
        };
    }]);