function EventHandler(){
    $('.ingredients').hide();
    $('.ingExpand').on('click', function() {
        $(this).parent().find('ul').toggle();
    });
}

var firstSearch = true;
// Doc ready
$(function(){

    // Shortcut function that performs search with the correct parameters.
    // Can be called without any arguments inline 
    function simpleSearch() {
        search( $( "input#query" ).val(), $( "#results" ), $( ".template.result" ) );
    };

    $( "button#search" ).click(function() {
        simpleSearch();
    });

    // Performs search when 'enter' key is pressed
    $( "input#query" ).keypress(function( event ) {
        if ( event.which == 13 ) simpleSearch();
    });

    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str) {
            return this.slice(0, str.length) == str;
        };
    }
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
        url: 'http://is-info320t4.ischool.uw.edu:8080/solr-example/collection1/select',
        dataType: 'JSONP',
        data: ajaxData,
        jsonp: 'json.wrf',
        success: function (data) {
            $("#results").fadeToggle(0);
            // currently it works so that when no results found, show spell checks
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
    $( "#front-page-content" ).remove();
    var result;
    $.each(docs, function(index, doc) {
        //result = $template.clone();
        //result.find( "a" ).prop( "href", doc.url);
        //result.find( "h3" ).append( doc.title );
        //result.find( ".url" ).append( doc.url );
        //result.find( ".content" ).append( maxWords(doc.content, 100) );
        // result.find(".content").append(pictureResults(doc.url, doc.content));
        //result.find(".col-lg-2 > img").attr("src", based(doc.url));
        //result.removeClass( "template" );
        //$container.append(result);
        getResults(doc);

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

function getResults(doc) {
    var image = "";
    var ingredients = new Array();

    if(/^.*\b(epicurious.com\/recipes)\b.*$/.test(doc.url)) {
        $.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent(doc.url) + '&callback=?', function(data){
            var elements = $(data.contents);
            var imgFound = $('#recipe_image > img', elements);
            image = "http://www.epicurious.com" + imgFound.attr("src");
            
            var ingFound = $('.ingredient', elements);
            for (var i = 0; i < ingFound.length; i++) {
                ingredients[i] = ingFound[i].innerText;
            }
        })
        .success(function() { 
            attachImageIngredients(image, doc.title, doc.url, ingredients);
        });
    } else if(/^.*\b(allrecipes)\b.*$/.test(doc.url)) {
        $.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent(doc.url) + '&callback=?', function(data) {
            var elements = $(data.contents);
            var found = $('#imgPhoto', elements);
            image = found.attr("src");
        })
        .success(function() { 
            attachImageIngredients(image, doc.title, doc.url, ingredients);
        });
    }
}

function attachImageIngredients(image, docTitle, url, ingredients) {
    
    var container = document.createElement("div");
    container.className = "search-result";
    var row = document.createElement('div');
    row.className = 'row';
    container.appendChild(row);
    var rowimg = document.createElement('div');
    rowimg.className = 'col-lg-2';
    row.appendChild(rowimg);
    var img = document.createElement('img');
    img.src =  image;
    img.alt = "recipePhoto";
    img.style.cssText = "width:125px; height:125px"
    rowimg.appendChild(img);
    var title = document.createElement('div');
    title.className = 'col-lg-10';
    row.appendChild(title);
    var result = document.createElement("a");
    result.href = url;
    result.className = "results";
    title.appendChild(result);
    var h3 = document.createElement('h3');
    h3.className = 'recipe-title';
    h3.innerText = docTitle;
    result.appendChild(h3);
    var row2 = document.createElement('div');
    row2.className = 'row';
    title.appendChild(row2);
    var row3 = document.createElement('div');
    row3.className = 'col-lg-6';
    row2.appendChild(row3);
    var ul1 = document.createElement('ul');
    row3.appendChild(ul1);
    var size = document.createElement('li');
    size.innerText = "Makes 4 servings";
    ul1.appendChild(size);
    var prep = document.createElement('li');
    prep.innerText = "Preparation Time: 15 minutes";
    ul1.appendChild(prep);
    var cookTime = document.createElement('li');
    cookTime.innerText = "1 hour";
    ul1.appendChild(cookTime);
    var row4 = document.createElement('div');
    row4.className = 'col-lg-6';
    row2.appendChild(row4);
    var ingDiv = document.createElement('button');
    ingDiv.className = 'ingExpand';
    ingDiv.innerText = "Ingredient List";
    row4.appendChild(ingDiv);
    var list = document.createElement("ul");
    list.className = "ingredients";
    row4.appendChild(list);
    for (var i = 0; i < ingredients.length; i++) {
        var li = document.createElement("li");
        li.innerText = ingredients[i];
        list.appendChild(li);
    }
    $('#results').append(container);
    EventHandler();
}