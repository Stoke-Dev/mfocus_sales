var surveyJSON, survey;

Survey.Survey.cssType = "bootstrap";

$(document).ready(function(){

    $.getJSON("js/survey-layout.json", function(data) {

        surveyJSON = data;

        survey = new Survey.Model(surveyJSON);

        $("#surveyElement").Survey({
            model:survey,
            onComplete:sendDataToServer,
            onUpdatePanelCssClasses:(a,b)=>{
                var el_id = "#"+b.panel.id;

                if (b.panel.name != "client_data") {
                    b.panel.state = "collapsed";
                }
                
                if (b.panel.parent && b.panel.parent.isPanel) {
                    $(el_id).addClass("mf-sub-panel");
                } else if (b.panel.isPanel) {
                    $(el_id).addClass("mf-panel");
                    // console.log(b);
                }
                
            },
            onUpdateQuestionCssClasses:(a,b)=>{
                var el_id = "#"+b.question.id;
                console.log(b);

                $(el_id).addClass("mf-question");
            }
        });

        console.log("JSON LOADED: SUCCESS");
    })
    .fail(function(jqxhr, textStatus, err) {
        $("#surveyElement").html("ERROR: Form framework could not be loaded");
        console.log("JSON ERROR: ", err);
    });

});


function sendDataToServer(survey) {
    var resultAsString = JSON.stringify(survey.data);
    alert(resultAsString); //send Ajax request to your web server.
}