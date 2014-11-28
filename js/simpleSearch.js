var firstSearch = true;
// Doc ready
$(function(){

    // Shortcut function that performs search with the correct parameters.
    // Can be called without any arguments inline 
    function simpleSearch() {
        search( $( "input#query" ).val(), $( "#results" ), $( ".template.result" ) );
    };

    $( "button#search" ).click(function() {simpleSearch()});

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
            $("#results").fadeToggle(0);
            if (data.response.numFound != 0) {
                renderResults(data.response.docs, $container, $template);
            } else {
                if (!jQuery.isEmptyObject(data.spellcheck.suggestions)) {
                    renderSpellcheck(JSON.stringify(data.spellcheck.suggestions[1].suggestion), $container);
                } else {
                    noSuggestions($container);
                }
            }
            $("#results").fadeToggle();
        }
    });
}

// Input: JSON array of results, results container, result HTML template
// Effect: Replaces results container with new results, and renders
// the appropriate HTML
// Output: void
function renderResults(docs, $container, $template){
    //document.getElementById("results").style.display = "none";
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
    //document.getElementById("results").style.display = "block";
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
function renderSpellcheck(suggestions, $container) {
    $container.empty(); // If there are any previous results, remove them

    var spellings = JSON.parse(suggestions);
    
    var result = document.createElement("h3");
  
    result.innerHTML = "Did you mean ";

    var word = document.createElement("span");
    word.className = "spellings";
    word.id = spellings[0];
    word.innerHTML = spellings[0];

    result.appendChild(word);
    for (var i = 1; i <= spellings.length - 1; i++) {
        result.innerHTML += ", ";
        var otherWord = document.createElement("span");
        otherWord.className = "spellings";
        otherWord.id = spellings[i];
        otherWord.innerHTML = spellings[i];
        result.appendChild(otherWord);
    }
    result.innerHTML += "?";
    $container.append(result);
    $( ".spellings" ).on("click", function() {
        search(event.target.id, $( "#results" ), $( ".template.result" ));
    });
}

function noSuggestions($container) {
    $container.empty();

    var result = document.createElement("h3");
    result.innerHTML = "This ingredient is not what you're looking for.";
    $container.append(result);
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
