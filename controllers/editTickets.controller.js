app.controller('editTicketsController', ['$scope', '$location', '$timeout', 'GitHub', 'Jira',
    function ($scope, $location, $timeout, GitHub, Jira) {

        $scope.btnTxt = "Edit";
        $scope.inEditProcess = false;
        $scope.status = 'Ready For QA';
        $scope.qa = 'Alex Strusberg';
        var tickets_array = null;

        (function () {
            GitHub.getNewReleaseCommitsSplitted()
                .then(function (commits) {
                    tickets_array = commits.withJiraTicket;
                    $scope.tickets = tickets_array.join();
                })
                .catch(function (e) {
                })
                .finally(function () {
                    $scope.loadingPage = false;
                });
        })();

        $scope.onEditClicked = function () {
            debugger;
            if ($scope.btnTxt === "Edit") {
                $scope.btnTxt = "Editing...";
                $scope.inTagProcess = true;
                Jira.changeAssignee(tickets_array)
                    .then(function () {
                        Jira.changeStatuses(tickets_array)
                    })
                    .then(function () {
                        $scope.btnTxt = "Finish";
                    })
                    .catch(function (e) {
                        $scope.btnTxt = "Close";
                        $scope.errMsg = e.data.message;
                    })
                    .finally(function () {
                        $scope.inEditProcess = false;
                    });
            } else {
                window.close();
            }
        };

        $scope.finish = function () {
            window.close();
        };

        $scope.back = function () {
            $location.path('/release-notes-confluence');
        };
    }]);