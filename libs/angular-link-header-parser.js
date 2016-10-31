(function () {
  angular
    .module("ig.linkHeaderParser", [])
    .factory("linkHeaderParser", linkHeaderParser);

  /* @ngInject */
  function linkHeaderParser($log) {
    var service = {
      parse: parse
    };

    return service;

    ////////////////////////////////////////////////////

    /**
     *
     * @param linkHeader
     * @returns {*}
     */
    function parse(linkHeader) {
      var linkHeaderObject = {};

      $log.debug("Link header: ", linkHeader);

      if ( typeof linkHeader !== "string" )
        return new Error("Expected a string as parameter type but received: '" + typeof linkHeader + "'!");
      if ( linkHeader.length == 0 )
        return new Error("Empty string provided!");

      var links = linkHeader.split(",");

      $log.debug("Links: ", links);

      _.forEach(links, function (link) {
        _parseElement(link, linkHeaderObject);
      });

      $log.debug("Object returned: ", linkHeaderObject);

      return linkHeaderObject;
    }

    ////////////////////////////////////////////////////

    /**
     *
     * @param element
     * @param object
     * @private
     */
    function _parseElement(element, object) {
      $log.debug("Element to parse: ", element);

      var items = element.split(";");

      items[ 0 ] = items[ 0 ].trim();
      items[ 1 ] = items[ 1 ].trim();

      $log.debug("Element splitted and trimmed: ", items);

      object[ _parseRelElement(items[ 1 ]) ] = _parseURLElement(items[ 0 ]);
    }

    /**
     *
     * @param relElement
     * @returns {*}
     * @private
     */
    function _parseRelElement(relElement) {
      $log.debug("REL element to parse: ", relElement);

      var items = relElement.split("=");

      items[ 1 ] = items[ 1 ].trim().toLowerCase();
      items[ 1 ] = items[ 1 ].replace(/"/g, "");

      $log.debug("Parsed REL element: ", items[ 1 ]);

      return items[ 1 ];
    }

    /**
     *
     * @param urlElement
     * @returns {*|{}}
     * @private
     */
    function _parseURLElement(urlElement) {
      $log.debug("URL element to parse: ", urlElement);

      urlElement = urlElement.replace(/^</, "").replace(/>$/, "");

      var extracted = URIUtil.parse(urlElement);

      extracted.url = urlElement;

      $log.debug("Extracted data: ", extracted);

      return extracted;
    }
  }
})();
