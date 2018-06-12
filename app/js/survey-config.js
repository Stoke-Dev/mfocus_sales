var surveyJSON, survey;

Survey.Survey.cssType = "bootstrap";

$(document).ready(function(){

    $.getJSON("js/survey-layout.json", function(data) {

        surveyJSON = data;

        survey = new Survey.Model(surveyJSON);

        //survey.completedHtml = "Generating Report...\n[coming soon]",
        survey.onComplete.add(sendDataToServer);
        survey.questionTitleLocation = "left";
        survey.onUpdatePanelCssClasses.add((a,b)=>{
            let el_id = "#"+b.panel.id;

            b.cssClasses.row = "mf-survey-row";

            if (b.panel.name != "client_data") {
                b.panel.state = "collapsed";
            }
            
            if (b.panel.name == "client_data") {
                b.cssClasses.panel.container = "sv_p_container first mf-panel";
            } else if (b.panel.name == "ctes") {
                b.cssClasses.panel.container = "sv_p_container last mf-panel";
            } else if (b.panel.parent && b.panel.parent.isPanel) {
                b.cssClasses.panel.container = "sv_p_container mf-sub-panel";
            } else if (b.panel.isPanel) {
                b.cssClasses.panel.container = "sv_p_container mf-panel";
            }
            
        });

        survey.onUpdateQuestionCssClasses.add((a,b)=>{
            b.cssClasses.mainRoot = "sv_qstn mf-question";
            b.cssClasses.title = "mf-question-title";
            b.cssClasses.error.root = "alert alert-danger mf-error";
            b.cssClasses.error.icon = "fas fa-exclamation-triangle";
            b.question.requiredErrorText = "This information is required."

            console.log(b)

        });

        $("#surveyElement").Survey({model:survey});

        console.log("JSON LOADED: SUCCESS");
    })
    .fail((jqxhr, textStatus, err)=>{
        $("#surveyElement").html("ERROR: Form framework could not be loaded");
        console.log("JSON ERROR: ", err);
    });

});


function sendDataToServer(survey) {
    var resultAsString = JSON.stringify(survey.data);
    alert(resultAsString); //send Ajax request to your web server.
}