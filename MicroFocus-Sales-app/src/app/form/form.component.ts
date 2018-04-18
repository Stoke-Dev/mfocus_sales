import { Component, OnInit } from '@angular/core';
import { SurveyStructureService } from '../survey-structure.service';

Survey.Survey.cssType = "bootstrap";

function sendDataToServer(survey) {
  //send Ajax request to your web server.
  alert("The results are:" + JSON.stringify(survey.data));
}
@Component({
  selector: 'ng-app',
        template: 
        "<div id='surveyElement'></div>",
})
export class FormComponent implements OnInit{
    constructor(private surveyStructure: SurveyStructureService) { }

    ngOnInit() {
      var survey = new Survey.Model(this.surveyStructure.surveyJSON);
      survey.onComplete.add(sendDataToServer);
      Survey.SurveyNG.render("surveyElement", { model: survey });
    }
}
