var firstSearch = true;
// Doc ready
$(function(){

    // Shortcut function that performs search with the correct parameters.
    // Can be called without any arguments inline 
    function simpleSearch() {
        search( $( "input#query" ).val(), $( "#results" ), $( ".template.result" ) );
    };

    $( "button#search" ).click(function() {simpleSearch});

    // Performs search when 'enter' key is pressed
    $( "input#query" ).keypress(function( event ) {
        if ( event.which == 13 ) simpleSearch();
    });
})

// Input: query string, results container, result HTML template
// Effect: makes an AJAX call to the server to get the results of the
// query, and then injects results into the DOM
// Output: void
function search(query, $container, $template){
    var ajaxData = {
            // 'q': query,
            'qf': 'content title^3.0',
            'wt': 'json',
            'indent': 'false',
            'defType': 'edismax',
            // changes made to spellcheck
            'q': query,
            'spellcheck': 'true',
            'spellcheck.q': query,
    }

    if (firstSearch) {
        ajaxData.spellcheck.build = true;
        firstSearch = false;
    }

    $.ajax({
        type: 'GET',
        url: 'http://is-info320t4.ischool.uw.edu:8080/tomcat7/solr-example/collection1/select',
        dataType: 'JSONP',
        data: ajaxData,
        jsonp: 'json.wrf',
        success: function (data) {
            if (data.response.numFound != 0) {
                renderResults(data.response.docs, $container, $template);
            } else {
                $(results).innerHTML = JSON.stringify(data.spellcheck.suggestions.suggestion);
                // renderSpellcheck(data.spellcheck.suggestions, $container, $template);
            }
        }
    });
}

// Input: JSON array of results, results container, result HTML template
// Effect: Replaces results container with new results, and renders
// the appropriate HTML
// Output: void
function renderResults(docs, $container, $template){
    $container.empty(); // If there are any previous results, remove them

    var result;
    $.each(docs, function(index, doc){
        result = $template.clone();
        result.find( ".title > a" )
            .prop( "href", doc.url)
            .find( "h3" )
            .append( doc.title );
        result.find( ".url" ).append( doc.url );
        result.find( ".content" ).append( maxWords(doc.content, 100) );
        // result.find(".content").append(pictureResults(doc.url, doc.content));
        result.removeClass( "template" );
        $container.append(result);
    });
}

// Cuts off lengthy content to a given maximum number of words
// Input: string of words, maximum number of words
// Effects: none
// Output: the trimmed words
function maxWords(content, max) {
    var words = content.split(' ', max);
    var idx;
    var cutContent = "";
    for (idx = 0; idx < words.length; idx++) {
	cutContent += words[idx];
	cutContent += (idx + 1 == words.length ? "" : " ");
    }
    return cutContent + "...";
}

// Input: JSON array of spellcheck, results container, result HTML template
// Effect: Replaces results container with spellchecks, and renders
// the appropriate HTML
// Output: void
function renderSpellcheck(suggestions, $container, $template) {
    $container.empty();
    var spellchecks = JSON.parse(suggestions);
    alert(JSON.stringify(suggestions));

}

// work in progress
function pictureResults(url, content) {
    // create tag add picture
    // findPicture(url, content);

}

// WIP
function findPicture(url, content) {
    var allRecipe = "allrecipes";
    if (url.indexOf(allRecipe) > -1) {
        content
    }

}
