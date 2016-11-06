// Initialize Angular
var app = angular.module('releaseVersion', ['ngMaterial', 'ngRoute', 'ig.linkHeaderParser'])
    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider
                // .when('/home', {
                //     templateUrl: 'test.html',
                //     controller: 'testController'
                // })
                .when('/home', {
                    templateUrl: 'home.html',
                    controller: 'homeController'
                })
                .when('/sign-in', {
                    templateUrl: 'sign-in.html',
                    controller: 'signInController'
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
                    templateUrl: '4-release-notes-github.html',
                    controller: 'releaseNotesGitHubController',
                })
                .when('/release-notes-confluence', {
                    templateUrl: '3-release-notes-confluence.html',
                    controller: 'releaseNotesConfluenceController',
                })
                .when('/edit-tickets', {
                    templateUrl: '5-edit-tickets.html',
                    controller: 'editTicketsController',
                });
        }]);

app.controller('popupController', ['$scope', '$location', '$timeout', 'User',
    function ($scope, $location, $timeout, User) {

        $scope.global = {
            isAuthenticated: false,
            user: null,
            repo: null,
            branch: null,
            newVersion: null,
            prerelease: true
        };

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
