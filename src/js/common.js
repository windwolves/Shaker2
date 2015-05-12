!(function() {

    var escapeMap = {
        '<': '&#60;',
        '>': '&#62;',
        '\'': '&#34;',
        '"': '&#39;',
        '&': '&#38;',
        '\n': '<br/>'
    };

    template.helper('superEscape', function(value) {
        return template.utils.$string(value).replace(/&(?![\w#]+;)|[<>"'\n]/g, function(s) {
            return escapeMap[s];
        });
    });

    $(function() {
        $('.loading').remove();
    });

})();
