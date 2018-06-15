var surveyJSON, survey;

Survey.Survey.cssType = "bootstrap";

$(document).ready(function(){

    $.getJSON("js/survey-layout.json", function(data) {

        surveyJSON = data;

        survey = new Survey.Model(surveyJSON);

        survey.completedHtml = "<div style='text-align:center; margin:11px;'><h3 style='margin-bottom:11px;'>Generating Report...</h3><em>[coming soon]</em><br><img style='width: 70%; display:inline-block;' src='img/Micro_Focus_SalesROI_Results_v1.png' /></div>",
        survey.onComplete.add(sendDataToServer);
        survey.questionTitleLocation = "left";
        survey.onUpdatePanelCssClasses.add((a,b)=>{
            b.cssClasses.row = "mf-survey-row";

            if (b.panel.name != "client_data" && b.panel.name != "data_panel") {
                b.panel.state = "collapsed";
            }
            
            if (b.panel.name == "client_data") {
                b.cssClasses.panel.container = "sv_p_container first mf-panel";
            } else if (b.panel.name == "data_panel") {
                b.cssClasses.panel.container = "sv_p_container last mf-panel";
            } else if (b.panel.parent && b.panel.parent.isPanel) {
                b.cssClasses.panel.container = `sv_p_container mf-sub-panel p-${b.panel.name}`;
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
        });

        $("#surveyElement").Survey({model:survey});

        $("[data-ex-all]").click((e)=>{
            let button = $(e.target);

            if ( button.attr("data-state") == "expanded" ) {
                survey.getAllPanels().map((a)=>{
                    if (a.parent.name == "data_panel") {
                        a.collapse();
                    }
                });
                button.attr("data-state", "");
                button.html("Expand All");
            } else {
                survey.getAllPanels().map((a)=>{
                    if (a.parent.name == "data_panel") {
                        a.expand();
                    }
                });
                button.attr("data-state", "expanded");
                button.html("Collapse All");
            }
        });

        $("[data-ex-sub]").click((e)=>{
            let button = $(e.target);

            let panel = survey.getAllPanels().find((a)=>{
                return a.name == button.attr("data-ex-sub");
            });
            
            if ( button.attr("data-state") == "expanded" ) {
                panel.elements.map((a)=>{
                    if (a.isPanel) {
                        a.collapse();
                    }
                });
                button.attr("data-state", "");
                button.html("Expand Subsections");
            } else {
                panel.elements.map((a)=>{
                    if (a.isPanel) {
                        a.expand();
                    }
                });
                button.attr("data-state", "expanded");
                button.html("Collapse Subsections");
            }
        });

        $("#mf_quick_directory").html(()=>{
            let markup = "";
            survey.getAllPanels().map((a)=>{
                if (a.parent.name == "data_panel") {
                   markup += `<ul><li><strong><a data-quickpick href='#${a.id}'>${a.title}</a></strong></li></ul>`;
                } else if (a.parent.name == "fte" || a.parent.name == "ctes" || a.parent.name == "cust") {
                    markup += `<ul><li><a data-quickpick href='#${a.id}'>- ${a.title}</a></li></ul>`;
                } else {
                   markup += `<li><a data-quickpick href='#${a.id}'>${a.title}</a></li>`;
                }
            });
            return markup;
        }).find("[data-quickpick]").each((i,e)=>{
            $(e).click(({target})=>{
                survey.page
                let p = survey.getAllPanels().find((p)=>{
                    return (`#${p.id}` == $(target).attr("href")); 
                });
                if (p.name == "data_panel" || p.name == "client_data") return;
                p.expand();
                while (p.parent.isPanel && p.parent.name != "data_panel") {
                    p.parent.expand();
                    p = p.parent;
                }
            });
        });

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
    $("main.mf-maincontent > h1").html("Download Client Report");

    $("#mf_quick_directory").html("");
}