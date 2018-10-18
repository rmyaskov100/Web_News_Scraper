$(document).ready(function(){


    function displayArticles(){
      $.getJSON("/articles", function(data) {
       
        for (var i = 0; i < data.length; i++) {
  
          var panelDiv = $("<div>")
          panelDiv.attr("id", data[i]._id)
          panelDiv.addClass("panel panel-default")
  
          var panelHeading = $("<div class='panel-heading' ></div>")
  
          var panelTitle = $("<h3 class='panel-title' ></h3>")
          
          
          var newATag = $("<a class='article-title'>");
          newATag.attr("target", "_blank")
          newATag.attr("href", data[i].url)
          newATag.text(data[i].headline)
  
          panelTitle.append(newATag)
          panelHeading.append(panelTitle)
          panelDiv.append(panelHeading)
  
          panelDiv.append(data[i].summary)
        
          if (data[i].isSaved){

            panelTitle.append("<button data-id='" + data[i]._id + "' class='btn btn-warning delete-button'>" + "Delete Article" + "</button>");
            panelTitle.append("<button data-id='" + data[i]._id + "' class='btn btn-success note-button'>" + "Article Notes" + "</button>");

            $("#saved-articles").append(panelDiv)
        
        }else{  

            panelTitle.append("<button data-id='" + data[i]._id + "' class='btn btn-primary save-button'>" + "Save Article" + "</button>");
           
            $("#articles").append(panelDiv)
          
          }
  
        }
      });
    }
  
    displayArticles();
  
    $(document).on("click", ".note-button", function() {
      
      // Saves the id from the button
      var thisId = $(this).attr("data-id");
      console.log(thisId)
  
      // Makes an ajax call for the Article
      $.ajax({
        method: "GET",
        url: "/articles/" + thisId
      })
        // Adds the note information to the modal
      .then(function(data) {
        console.log(data);
  
        $("#noteModalLabel").empty()
        $("#noteModalBody").empty()
        $("#noteModalLabel").append(data.headline +"<br> <textarea class='form-control' id='titleinput' rows='2' placeholder='Note Title'></textarea>")
        $("#noteModalBody").append("<textarea class='form-control' id='bodyinput' rows='6' placeholder='Note Body'></textarea>")
  
        // Grabs the id of the button and gives the save button(in the modal) a data attribute of the id
        $("#savenote").attr("data-id", data._id)
        
        if (data.note) {
          // Places the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Places the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
  
        $("#noteModal").modal("show");
  
      });
    });
  
  
  
    // Once the savenote button is clicked
    $(document).on("click", "#savenote", function() {
      // Grabs the id associated with the article from the submit button
      var thisId = $(this).attr("data-id");
  
      console.log(thisId)
      console.log($("#titleinput").val())
  
      // Runs a POST request to change the note, using what's entered in the inputs
      $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          // Value taken from title input
          title: $("#titleinput").val(),
          // Value taken from note textarea
          body: $("#bodyinput").val()
        }
      })
        // Once everything is done
      .then(function(data) {
          // Log in the response
        console.log(data);
          
      });
  
      // Removes the values entered in the input and textarea for note entry
      $("#titleinput").val("");
      $("#bodyinput").val("");
    });
  
    // Once the scrape button is clicked
    $(document).on("click", "#scrape-button", function(){
      $.ajax({
        method: "GET",
        url: "/scrape" 
        
      }).then(function(data) {
        // Logs the response
        console.log("hello")
        console.log(data);
  
        // Loads the articels onto the page
        displayArticles()
  
        $("#scrapeModalLabel").text("You successfully scraped new articles")
        $("#scrapeModalBody").text("Yaaay!")
  
        $("#scrapeModal").modal("show");
  
      });
    });
  
  
    $(document).on("click", ".save-button", function(){
      console.log(this)
  
      var id = ($(this).attr("data-id"));
      $.ajax({
        method: "PUT",
        url: "/articles/" + id
        
      })
        // Once everything is done
        .then(function(data) {
          // Log the response
          console.log(data);
  
          // Removes the saved article from the index page
          $("#" + id).remove();
         
        });
    });
  
  
    $(document).on("click", ".delete-button", function(){
      console.log(this)
  
      var id = ($(this).attr("data-id"));
      $.ajax({
        method: "DELETE",
        url: "/articles/" + id
        
      }).then(function(data) {
        // Logs the response
        console.log("hello")
        console.log(data);
  
       // Removes the article from the saved page
        $("#" + id).remove();
       
      });
    });
  
  
  })