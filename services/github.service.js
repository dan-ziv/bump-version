app.service( 'GitHub', [ '$http', '$q', 'User', 'Jira', 'linkHeaderParser',
    function ( $http, $q, User, Jira, linkHeaderParser ) {

        var _apiPrefix = 'https://api.github.com';
        var _owner = null;
        var _repo = null;
        var _branch = null;
        var _defaultSettingsFilePath = 'includes/DefaultSettings.php';
        // var _defaultSettingsFilePath = 'DefaultSettings.php';
        var _statuses = [ "CLOSED", "READY FOR QA", "DEPLOYED" ];
        var _currentVersion = null;
        var _jiraTickets = null;
        var _nonJiraTickets = null;

        this.setJiraTickets = function ( jiraTickets ) {
            _jiraTickets = jiraTickets;
        };

        this.setNonJiraTickets = function ( nonJiraTickets ) {
            _nonJiraTickets = nonJiraTickets;
        };

        this.getCurrentVersion = function () {
            return _doGetFileContents()
                .then( function ( contents ) {
                    var content = contents.content;
                    var lines = content.split( '\n' );
                    for ( var i = 0; i < lines.length; i++ ) {
                        var line = lines[ i ];
                        if ( line.startsWith( "$wgMwEmbedVersion" ) ) {
                            var parts = line.split( '=' );
                            _currentVersion = _extractVersion( parts[ 1 ] );
                            return _currentVersion;
                        }
                    }
                } );
        };

        this.setRepository = function ( repo ) {
            var parts = repo.split( '/' );
            _owner = parts[ 0 ];
            _repo = parts[ 1 ];
        };

        this.setBranch = function ( branch ) {
            _branch = branch;
        };

        this.tagRepository = function ( newVersion ) {
            return _tagRepository( newVersion );
        };

        this.commitFile = function ( newVersion ) {
            return _updateFile( newVersion );
        };

        this.getUserRepositories = function () {
            return _doGetUserRepositories();
        };

        this.getRepositoryBranches = function ( repo ) {
            return _doGetRepositoryBranches( repo );
        };

        this.createReleaseNotes = function ( tag, titles, prerelease ) {
            var body = "";
            for ( var i = 0; i < titles.length; i++ ) {
                var title = titles[ i ];
                var status = _containsAnyStatus( title );
                if ( status ) {
                    title = titles.replace( status, "" );
                }
                body += "* " + title + "\n";
            }
            return _doCreateReleaseNotes( tag, body, prerelease );
        };

        this.getNewReleaseCommitsSplitted = function ( releaseInfo ) {
            if ( _jiraTickets !== null && _nonJiraTickets !== null ) {
                var newRelease = {
                    withJiraTicket: _jiraTickets,
                    withOutJiraTicket: _nonJiraTickets
                };
                _jiraTickets = null;
                _nonJiraTickets = null;
                return $q.resolve( newRelease );
            } else {
                return this.getCommitsSinceLastRelease( releaseInfo ).then( function ( commits ) {
                    return _splitToJiraAndNonJira( commits );
                } );
            }
        };

        this.getNewReleaseCommitsUnified = function ( releaseInfo ) {
            if ( _jiraTickets !== null && _nonJiraTickets !== null ) {
                return Jira.getIssues( _jiraTickets ).then( function ( jiras ) {
                    var titles = _extractTitlesFromJira( jiras );
                    return titles.concat( _nonJiraTickets );
                } );
            } else {
                return this.getCommitsSinceLastRelease( releaseInfo ).then( function ( commits ) {
                    var newRelease = _splitToJiraAndNonJira( commits );
                    if ( newRelease.withJiraTicket.length > 0 ) {
                        return Jira.getIssues( newRelease.withJiraTicket ).then( function ( jiras ) {
                            var titles = _extractTitlesFromJira( jiras );
                            return titles.concat( newRelease.withOutJiraTicket );
                        } );
                    } else {
                        return newRelease.withOutJiraTicket;
                    }
                } );
            }
        };

        this.getFilePath = function () {
            return _defaultSettingsFilePath;
        };

        this.getCommitsSinceLastRelease = function ( releaseInfo ) {
            // TODO: get all commits - this is gets now only the first 30
            return _doGetCommits()
                .then( function ( commits ) {
                    var i, msg, commit, bumpVersionPrefix = "bump version to ";
                    if ( releaseInfo.prerelease ) {
                        for ( i = 1; i < commits.length; i++ ) {
                            commit = commits[ i ];
                            msg = commit.commit.message.toLowerCase();
                            if ( msg === bumpVersionPrefix + _currentVersion ||
                                (msg.includes( "bump" ) && msg.includes( "" + _currentVersion )) ) {
                                return commits.slice( 1, i );
                            }
                        }
                        return [];
                    } else {
                        var allReleaseCommits = [];
                        for ( i = 0; i < commits.length; i++ ) {
                            commit = commits[ i ];
                            msg = commit.commit.message.toLowerCase();
                            if ( msg === bumpVersionPrefix + releaseInfo.lastOfficialVersion ||
                                (msg.includes( "bump" ) && msg.includes( "" + releaseInfo.lastOfficialVersion )) ) {
                                return allReleaseCommits;
                            }
                            else if ( !msg.includes( bumpVersionPrefix ) && !msg.includes( "bump to" ) ) {
                                allReleaseCommits.push( commit );
                            }
                        }
                        return [];
                    }
                } );
        };

        function _extractVersion( s ) {
            s = s.replace( ";", "" );
            s = s.trim();
            return s.substring( 1, s.length - 1 );
        }

        function _doGetRepositoryBranches( repo ) {
            var deferred = $q.defer();

            $http.get( _apiPrefix + '/repos/' + repo + '/branches?access_token=' + User.getOAuthToken() )
                 .then( function ( response ) {
                     var pages = _getNumberOfPages( response.headers().link );
                     var branches = [];
                     var promises = [];
                     for ( var i = 1; i <= pages; i++ ) {
                         promises.push( _doGetMultiRepositoryBranches( repo, i ) );
                     }
                     $q.all( promises ).then( function ( results ) {
                         for ( var i = 0; i < results.length; i++ ) {
                             branches = branches.concat( results[ i ] );
                         }
                         deferred.resolve( branches );
                     } );
                 } )
                 .catch( function ( e ) {
                     deferred.reject( e );
                 } );

            return deferred.promise;
        }

        function _doGetMultiRepositoryBranches( repo, page ) {
            var deferred = $q.defer();

            $http.get( _apiPrefix + '/repos/' + repo + '/branches?access_token=' + User.getOAuthToken() + '&page=' + page )
                 .then( function ( response ) {
                     deferred.resolve( response.data );
                 } )
                 .catch( function ( e ) {
                     deferred.reject( e );
                 } );

            return deferred.promise;
        }

        function _doGetUserRepositories() {
            var deferred = $q.defer();

            $http.get( _apiPrefix + '/user/repos?access_token=' + User.getOAuthToken()
                + '&affiliation=collaborator,organization_member' )
                 .then( function ( response ) {
                     var pages = _getNumberOfPages( response.headers().link );
                     var repos = [];
                     var promises = [];
                     for ( var i = 1; i <= pages; i++ ) {
                         promises.push( _doGetMultiUserRepositories( i ) );
                     }
                     $q.all( promises ).then( function ( results ) {
                         for ( var i = 0; i < results.length; i++ ) {
                             repos = repos.concat( results[ i ] );
                         }
                         deferred.resolve( repos );
                     } );
                 } )
                 .catch( function ( e ) {
                     deferred.reject( e );
                 } );

            return deferred.promise;
        }

        function _doGetMultiUserRepositories( page ) {
            var deferred = $q.defer();

            $http.get( _apiPrefix + '/user/repos?access_token=' + User.getOAuthToken()
                + '&affiliation=collaborator,organization_member&page=' + page )
                 .then( function ( response ) {
                     deferred.resolve( response.data );
                 } )
                 .catch( function ( e ) {
                     deferred.reject( e );
                 } );

            return deferred.promise;
        }

        function _extractTitlesFromJira( jiras ) {
            var titles = [];
            if ( jiras ) {
                for ( var i = 0; i < jiras.length; i++ ) {
                    var jira = jiras[ i ];
                    titles.push( jira.key + ' - ' + jira.fields.summary );
                }
            }
            return titles;
        }

        function _splitToJiraAndNonJira( commits ) {
            var newRelease = { withJiraTicket: [], withOutJiraTicket: [] };
            for ( var i = 0; i < commits.length; i++ ) {
                var commit = commits[ i ];
                var msg = commit.commit.message;
                var regexp = /[A-Z]{3}-[0-9]{4,5}/g;
                var keys_results = msg.match( regexp );
                if ( keys_results && keys_results.length ) {
                    for ( var j = 0; j < keys_results.length; j++ ) {
                        if ( _.indexOf( newRelease.withJiraTicket, keys_results[ j ] ) === -1 ) {
                            newRelease.withJiraTicket.push( keys_results[ j ] );
                        }
                    }
                }
                else {
                    var lines = msg.split( '\n' );
                    var commitTitle = lines[ 0 ];
                    if ( _.indexOf( newRelease.withOutJiraTicket, commitTitle ) === -1 ) {
                        newRelease.withOutJiraTicket.push( commitTitle );
                    }
                }
            }
            return newRelease;
        }

        function _getCurrentBranch( version, page ) {
            var splitVersion = version.split( '.' );
            var branchPrefix = splitVersion[ 0 ] + '.' + splitVersion[ 1 ];
            return _doListBranches( page )
                .then( function ( branches ) {
                    if ( branches.length > 0 ) {
                        for ( var i = 0; i < branches.length; i++ ) {
                            var branch = branches[ i ];
                            if ( branch.name.startsWith( branchPrefix ) ) {
                                return branch.name;
                            }
                        }
                        return _getCurrentBranch( version, page + 1 );
                    }
                    else {
                        return null;
                    }
                } );
        }

        function _doListBranches( page ) {
            var deferred = $q.defer();

            $http.get( _apiPrefix + '/repos/' + _owner + '/' + _repo + '/branches?page=' + page )
                 .then( function ( response ) {
                     deferred.resolve( response.data );
                 } )
                 .catch( function ( e ) {
                     deferred.reject( e );
                 } );

            return deferred.promise;
        }

        function _containsAnyStatus( title ) {
            for ( var i = 0; i < _statuses.length; i++ ) {
                var status = _statuses[ i ];
                if ( title.indexOf( status ) != -1 ) {
                    return status;
                }
            }
            return null;
        }

        function _doCreateReleaseNotes( tag, body, prerelease ) {
            var deferred = $q.defer();

            $http.post( _apiPrefix + '/repos/' + _owner + '/' + _repo + '/releases?access_token=' + User.getOAuthToken(), {
                "tag_name": "v" + tag,
                "target_commitish": _branch,
                "name": "v" + tag,
                "body": body,
                "draft": false,
                "prerelease": prerelease
            } ).then( function ( response ) {
                deferred.resolve( response.data );
            } ).catch( function ( e ) {
                deferred.reject( e );
            } );

            return deferred.promise;
        }

        function _doGetCommits() {
            var deferred = $q.defer();

            $http.get( _apiPrefix + '/repos/' + _owner + '/' + _repo + '/commits?sha=' + _branch )
                 .then( function ( response ) {
                     deferred.resolve( response.data );
                 } )
                 .catch( function ( e ) {
                     deferred.reject( e );
                 } );

            return deferred.promise;
        }

        function _updateFile( newVersion ) {
            return _doGetFileContents()
                .then( function ( contents ) {
                    var oldMwEmbedVersion = null;
                    var content = contents.content;
                    var lines = content.split( '\n' );
                    for ( var i = 0; i < lines.length; i++ ) {
                        var line = lines[ i ];
                        if ( line.startsWith( "$wgMwEmbedVersion" ) ) {
                            oldMwEmbedVersion = line;
                            break;
                        }
                    }
                    var newMwEmbedVersion = "$wgMwEmbedVersion = '" + newVersion + "';";
                    contents.content = btoa( contents.content.replace( oldMwEmbedVersion, newMwEmbedVersion ) );
                    return _doCommitFile( contents, newVersion );
                } );
        }

        function _doGetFileContents() {
            var deferred = $q.defer();

            $http.get( _apiPrefix + '/repos/' + _owner + '/' + _repo + '/contents/' + _defaultSettingsFilePath + '?ref=' + _branch )
                 .then( function ( response ) {
                     deferred.resolve( { sha: response.data.sha, content: atob( response.data.content ) } );
                 } )
                 .catch( function ( e ) {
                     deferred.reject( e );
                 } );

            return deferred.promise;
        }

        function _doCommitFile( contents, nextVersion ) {
            var deferred = $q.defer();

            $http.put( _apiPrefix + '/repos/' + _owner + '/' + _repo +
                '/contents/' + _defaultSettingsFilePath + '?access_token=' + User.getOAuthToken(), {
                "message": "Bump version to " + nextVersion,
                "content": contents.content,
                "sha": contents.sha,
                "branch": _branch
            } ).then( function ( response ) {
                deferred.resolve( response.data );
            } ).catch( function ( e ) {
                deferred.reject( e );
            } );

            return deferred.promise;
        }

        function _tagRepository( tagVersion ) {
            return _doGetReference()
                .then( function ( response ) {
                    return _doCreateTag( response.object.sha, tagVersion )
                        .then( function ( response ) {
                            return _doCreateReference( response.sha, response.tag );
                        } );
                } );
        }

        function _doGetReference() {
            var deferred = $q.defer();

            $http.get( _apiPrefix + '/repos/' + _owner + '/' + _repo + '/git/refs/heads/' + _branch )
                 .then( function ( response ) {
                     deferred.resolve( response.data );
                 } )
                 .catch( function ( e ) {
                     deferred.reject( e );
                 } );

            return deferred.promise;
        }

        function _doCreateTag( sha, tagVersion ) {
            var deferred = $q.defer();

            $http.post( _apiPrefix + '/repos/' + _owner + '/' + _repo + '/git/tags' + "?access_token=" + User.getOAuthToken(), {
                "tag": "v" + tagVersion,
                "message": "v" + tagVersion,
                "object": sha,
                "type": "commit",
            } ).then( function ( response ) {
                deferred.resolve( response.data );
            } ).catch( function ( e ) {
                deferred.reject( e );
            } );

            return deferred.promise;
        }

        function _doCreateReference( sha, tag ) {
            var deferred = $q.defer();

            $http.post( _apiPrefix + '/repos/' + _owner + '/' + _repo + '/git/refs' + "?access_token=" + User.getOAuthToken(), {
                "ref": "refs/tags/" + tag,
                "sha": sha
            } ).then( function ( response ) {
                deferred.resolve( response.data );
            } ).catch( function ( e ) {
                deferred.reject( e );
            } );

            return deferred.promise;
        }

        function _getNumberOfPages( header ) {
            if ( !header ) return 1;
            var link = linkHeaderParser.parse( header );
            return link.last.page;
        }
    } ] );