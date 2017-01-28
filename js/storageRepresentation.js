var StorageRepresentation = (function () {
    var instance;

    this._StorageRepresentation = function () {
    };

    this._StorageRepresentation.prototype.getValue = function (user, pageData) {
        return _getValue(user, pageData);
    };

    function _getIssuesRows(pageData) {
        var rows = '';
        _.forEach(pageData.issues.withJiraTicket, function (ticketID) {
            rows += _getJiraIssueRow(ticketID);
        });
        _.forEach(pageData.issues.withOutJiraTicket, function (title) {
            rows += _getNonJiraIssueRow(title);
        });
        return rows;
    }

    function _getNonJiraIssueRow(title) {
        return '<tr><td colspan="1"><p class="p1">' + title + '</p></td><td colspan="1"><br /></td></tr>';
    }

    function _getJiraIssueRow(id) {
        return '<tr><td colspan="1">' +
            '<div class="content-wrapper"><p><ac:structured-macro ac:name="jira" ac:schema-version="1" ac:macro-id="">' +
            '<ac:parameter ac:name="server">JIRA (kaltura.atlassian.net)</ac:parameter><ac:parameter ac:name="serverId">a419ae7b-e9d4-3c51-916d-f53408cab6b4</ac:parameter>' +
            '<ac:parameter ac:name="key">' + id + '</ac:parameter></ac:structured-macro></p></div></td><td colspan="1"><br /></td></tr>';
    }

    function _getValue(user, pageData) {
        return '<ac:layout><ac:layout-section ac:type="single"><ac:layout-cell><h1 style="text-align: center;">' + pageData.subTitle + '</h1>' +
            '<ac:structured-macro ac:name="section" ac:schema-version="1" ac:macro-id="0a3b12cf-9e3b-451c-8bf4-53c38b9e0e2f">' +
            '<ac:parameter ac:name="border">true</ac:parameter><ac:rich-text-body><ac:structured-macro ac:name="column" ac:schema-version="1" ac:macro-id="83152907-532c-432d-8724-041f800c8f45">' +
            '<ac:rich-text-body><ac:structured-macro ac:name="panel" ac:schema-version="1" ac:macro-id="c16bd079-7fa3-47d5-9754-ea75939c9126">' +
            '<ac:parameter ac:name="bgColor">#E1E1E1</ac:parameter><ac:parameter ac:name="titleColor">#ffffff</ac:parameter><ac:parameter ac:name="titleBGColor">#009688</ac:parameter>' +
            '<ac:parameter ac:name="title">Version Summary</ac:parameter><ac:rich-text-body><p>This version contain the following major issues:</p><ac:task-list>' +
            '<ac:task>' +
            '<ac:task-id>41</ac:task-id>' +
            '<ac:task-status>' + pageData.versionSummary.content + '</ac:task-status>' +
            '<ac:task-body>Content</ac:task-body>' +
            '</ac:task>' +
            '<ac:task>' +
            '<ac:task-id>43</ac:task-id>' +
            '<ac:task-status>' + pageData.versionSummary.fixedBugs + '</ac:task-status>' +
            '<ac:task-body>Fixed Bugs</ac:task-body>' +
            '</ac:task>' +
            '<ac:task>' +
            '<ac:task-id>42</ac:task-id>' +
            '<ac:task-status>' + pageData.versionSummary.newFeatures + '</ac:task-status>' +
            '<ac:task-body>New Features</ac:task-body>' +
            '</ac:task>' +
            '</ac:task-list>' +
            '<p><br /></p></ac:rich-text-body></ac:structured-macro></ac:rich-text-body></ac:structured-macro>' +
            '<ac:structured-macro ac:name="column" ac:schema-version="1" ac:macro-id="f20ab485-dbdd-4274-90b9-c9447fe62217">' +
            '<ac:parameter ac:name="width">30%</ac:parameter><ac:rich-text-body><table class="wrapped relative-table" style="width: 100.0%;">' +
            '<colgroup><col style="width: 8.56322%;" /><col style="width: 91.4368%;" /></colgroup><tbody><tr><th><br /></th><th colspan="1">' +
            '<br /></th></tr><tr><td>Date</td><td colspan="1"><div class="content-wrapper"><span>&nbsp;</span><time datetime="' + moment().format('YYYY-MM-DD') + '" />' +
            '<span>&nbsp;</span></div></td></tr><tr><td>Written by</td><td colspan="1"><div class="content-wrapper"><p>' +
            '<ac:link><ri:user ri:userkey="' + user.userKey + '" /></ac:link></p></div></td></tr><tr><td>HTML5 Lib test link</td>' +
            '<td colspan="1"><p><a href="' + pageData.libTestUrl + '">' + pageData.libTestUrl + '</a>' +
            '</p></td></tr><tr><td>HTML5 Github</td><td colspan="1">' +
            '<a href="' + pageData.githubUrl + '">' + pageData.githubUrl + '</a></td></tr><tr>' +
            '<td colspan="1">Notify</td><td colspan="1"><div class="content-wrapper"><p><ac:link><ri:user ri:userkey="ff80808150d48be20150f5a1df780010" />' +
            '</ac:link><ac:link><ri:user ri:userkey="ff8080813fbbeb41013fbbebda4b0032" /></ac:link>, <ac:link><ri:user ri:userkey="ff808081482ecba901483218cc5b0001" />' +
            '</ac:link>, <ac:link><ri:user ri:userkey="ff8080813fbbeb41013fbbebda330003" /></ac:link>, <ac:link><ri:user ri:userkey="ff8080813fbbeb41013fbbebdb57004d" />' +
            '</ac:link>, <ac:link><ri:user ri:userkey="ff80808142b119460142b22aebc10003" /></ac:link>, <ac:link><ri:user ri:userkey="ff8080814539ad6a01454066cdfe0003" />' +
            '</ac:link>, <ac:link><ri:user ri:userkey="ff8080814b6bfdd4014b7343c2e70003" /></ac:link>, <ac:link><ri:user ri:userkey="ff8080813fbbeb41013fbbebdb580056" />' +
            '</ac:link>, <ac:link><ri:user ri:userkey="ff80808143ad8bf90143b97b79e10007" /></ac:link>, <ac:link><ri:user ri:userkey="ff808081477a7e3c0147d5494da0000d" />' +
            '</ac:link>, <ac:link><ri:user ri:userkey="ff808081428cb5c30142ae93e1f10003" /></ac:link>, <ac:link><ri:user ri:userkey="ff80808150319e0401503befae7f0002" />' +
            '</ac:link>, <ac:link><ri:user ri:userkey="ff8080813fbbeb41013fbbebdbcc00ad" /></ac:link> <ac:link><ri:user ri:userkey="ff8080813fbbeb41013fbbebdb580051" />' +
            '</ac:link>, <ac:link><ri:user ri:userkey="ff80808153347cbf0153376dc8a20004" /></ac:link>, <ac:link><ri:user ri:userkey="ff808081529a62670152a135b2820004" />' +
            '</ac:link> <ac:link><ri:user ri:userkey="ff808081565289c801566531cbba0002" /></ac:link> <ac:link><ri:user ri:userkey="ff80808156ecfe590156fe3dcc040002" />' +
            '</ac:link> <ac:link><ri:user ri:userkey="ff8080815971003d0159825c259a0004" /></ac:link> <ac:link><ri:user ri:userkey="ff8080815971003d0159825c259a0004" />' +
            '</ac:link></p></div></td></tr></tbody></table><p class="auto-cursor-target"><br /></p><p><br /></p></ac:rich-text-body></ac:structured-macro>' +
            '</ac:rich-text-body></ac:structured-macro></ac:layout-cell></ac:layout-section><ac:layout-section ac:type="single"><ac:layout-cell>' +
            '<ac:structured-macro ac:name="panel" ac:schema-version="1" ac:macro-id="33b9a885-3002-4138-bab2-a6dc3e338cb0"><ac:parameter ac:name="bgColor">' +
            '#E1E1E1</ac:parameter><ac:parameter ac:name="titleColor">#ffffff</ac:parameter><ac:parameter ac:name="titleBGColor">#009688</ac:parameter>' +
            '<ac:parameter ac:name="title">Fixed Bugs and New features</ac:parameter><ac:rich-text-body><table class="wrapped"><colgroup>' +
            '<col style="width: 305.0px;" /><col style="width: 94.0px;" /></colgroup><tbody><tr><th><p>issue</p></th><th>Comments</th></tr>'
            + _getIssuesRows(pageData) + '</tbody>' +
            '</table></ac:rich-text-body>' +
            '</ac:structured-macro><ac:structured-macro ac:name="panel" ac:schema-version="1" ac:macro-id="125b2425-67d8-4651-87dd-483c397b6023">' +
            '<ac:parameter ac:name="bgColor">#E1E1E1</ac:parameter><ac:parameter ac:name="titleColor">#ffffff</ac:parameter><ac:parameter ac:name="titleBGColor">#009688</ac:parameter>' +
            '<ac:parameter ac:name="title">Important to know </ac:parameter><ac:rich-text-body><p>' + pageData.importantToKnow + '<br /></p></ac:rich-text-body></ac:structured-macro>' +
            '<ac:structured-macro ac:name="panel" ac:schema-version="1" ac:macro-id="d1c4a939-32f2-4ce5-a0a1-cc492f12983f"><ac:parameter ac:name="bgColor">#E1E1E1</ac:parameter>' +
            '<ac:parameter ac:name="titleColor">#ffffff</ac:parameter><ac:parameter ac:name="titleBGColor">#009688</ac:parameter><ac:parameter ac:name="title">Known issue </ac:parameter>' +
            '<ac:rich-text-body><p>' + pageData.knownIssues + '<br /></p></ac:rich-text-body></ac:structured-macro><ac:structured-macro ac:name="panel" ac:schema-version="1" ac:macro-id="b3478253-6f19-4840-b0f2-fbe82e44d917">' +
            '<ac:parameter ac:name="bgColor">#E1E1E1</ac:parameter><ac:parameter ac:name="titleColor">#ffffff</ac:parameter><ac:parameter ac:name="titleBGColor">#009688</ac:parameter>' +
            '<ac:parameter ac:name="title">Pre Sanity Test</ac:parameter><ac:rich-text-body><p>' + pageData.preSanityTests + '<br /></p></ac:rich-text-body></ac:structured-macro></ac:layout-cell>' +
            '</ac:layout-section></ac:layout><ac:layout><ac:layout-section ac:type="single"><ac:layout-cell><p><br /></p></ac:layout-cell></ac:layout-section>' +
            '<ac:layout-section ac:type="single"><ac:layout-cell><p><br /></p><p><br /></p><p><br /></p><p><br /></p><p><br /></p></ac:layout-cell></ac:layout-section>' +
            '</ac:layout>';
    }

    function createInstance() {
        return new _StorageRepresentation();
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();