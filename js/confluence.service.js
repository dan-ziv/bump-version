app.service('Confluence', ['$http', '$q', function ($http, $q) {

    var _html5LibTestLink;
    var _html5Github;
    var _title;
    var _subTitle;
    var _issues = [];
    var _issueLinkPrefix = 'https://kaltura.atlassian.net/browse/';
    var _notify = ["Itan bar-peled", "Aya Taplashvili", "Alex Strusberg", "Itay Kinnrot", "Eliza Sapir", "Amir Chervinsky",
        "Oren M.", "Einat Rolnik", "asher shiratzky", "Shomron Koush", "Lihi Barak", "Michal Zomper", "Ohad Kahana",
        "Simeon Leiserach", "Uri Gilad", "Yair Ansbacher", "Gilad Nadav", "Dan Ziv", "Anton Afanasiev"];

    this.createReleaseNotes = function (commits, newVersion) {
        _title = "HTML5 v" + newVersion;
        _subTitle = "HTML5 Release notes for version: v" + newVersion;
        _html5LibTestLink = 'http://kgit.html5video.org/tags/v' + newVersion + '/mwEmbedLoader.php';
        _html5Github = 'https://github.com/kaltura/mwEmbed/releases/tag/v' + newVersion;
        var keys = _getIssuesKeys(commits);
        _.forEach(keys.withOutKeys, function (title) {
            _issues.push(title)
        });
        _.forEach(keys.withKeys, function (issue) {
            _issues.push(_issueLinkPrefix + issue);
        });
    };

    function createMarkup() {
        var markup =
            '{section:border=true}'
            + '{column}'
            + '{panel:title=Version Summary|titleBGColor=#009688|titleColor=#ffffff|bgColor=#E1E1E1}'
            + 'This version contain the following major issues:'
            + '{tasklist}'
            + '{tasklist}'

            + '{panel}'
            + '{column}'

            + '{column:width=30%}'

            + '{column}'
            + '{section}'

            + '{panel:title=Fixed Bugs and New features |titleBGColor=#009688|titleColor=#ffffff|bgColor=#E1E1E1}'
            + '{panel}'

            + '{panel:title=Important to know|titleBGColor=#009688|titleColor=#ffffff|bgColor=#E1E1E1}'
            + '{panel}'

            + '{panel:title=Known issues|titleBGColor=#009688|titleColor=#ffffff|bgColor=#E1E1E1}'
            + '{panel}'

            + '{panel:title=Pre Sanity Test|titleBGColor=#009688|titleColor=#ffffff|bgColor=#E1E1E1}'
            + '{panel}'
    }
}]);