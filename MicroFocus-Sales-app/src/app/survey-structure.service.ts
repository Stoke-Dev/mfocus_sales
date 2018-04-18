import { Injectable } from '@angular/core';

@Injectable()
export class SurveyStructureService {

  constructor() { }

  //Survey Structure
  public surveyJSON = {
    "pages": [
     {
      "name": "page1",
      elements: [
       {
        type: "panel",
        name: "panel1",
        elements: [
         {
          type: "text",
          name: "question1",
          title: "Number of FTEs",
          isRequired: true,
          inputType: "number"
         },
         {
          type: "text",
          name: "question2",
          title: "Average Wage"
         },
         {
          type: "text",
          name: "question3",
          title: "Average Annual Turn-over (%)"
         },
         {
          type: "panel",
          name: "panel2",
          elements: [
           {
            type: "text",
            name: "question4",
            title: "Average IT Staff Wage"
           }
          ],
          title: "IT Staff"
         },
         {
          type: "panel",
          name: "panel3",
          elements: [
           {
            type: "text",
            name: "question5",
            title: "Number of identity connected systems (simple)"
           },
           {
            type: "text",
            name: "question6",
            title: "Number of identity connected systems (medium)"
           },
           {
            type: "text",
            name: "question7",
            title: "Number of identity connected systems (complex)"
           },
           {
            type: "text",
            name: "question8",
            title: "Average number of entitlements / staff"
           },
           {
            type: "text",
            name: "question9",
            title: "* Staff in change the business (%)"
           },
           {
            type: "text",
            name: "question10",
            title: "* Change the business entitlement changes / year"
           }
          ],
          title: "Fulfilment"
         },
         {
          type: "panel",
          name: "panel4",
          elements: [
           {
            type: "text",
            name: "question11",
            title: "* Average # of forgotten passwords / staff /year"
           },
           {
            type: "text",
            name: "question12",
            title: "* Average cost of helpdesk per call"
           },
           {
            type: "text",
            name: "* Average cost of helpdesk per password reset"
           },
           {
            type: "text",
            name: "* Average helpdesk wait time (minutes)"
           },
           {
            type: "text",
            name: "question13",
            title: "* Percentage \"Self Service\" Password Reset"
           }
          ],
          title: "Self Service"
         },
         {
          type: "panel",
          name: "panel5",
          elements: [
           {
            type: "text",
            name: "* Number of identity workflows (simple)"
           },
           {
            type: "text",
            name: "* Number of identity workflows (medium)"
           },
           {
            type: "text",
            name: "* Number of identity workflows (complex)"
           },
           {
            type: "text",
            name: "* Average number of workflows / staff / year"
           }
          ],
          title: "* Workflows"
         },
         {
          type: "panel",
          name: "panel6",
          elements: [
           {
            type: "text",
            name: "question14",
            title: "* Average approver wage"
           },
           {
            type: "text",
            name: "question15",
            title: "* Average time to approve (mins)"
           },
           {
            type: "text",
            name: "question16",
            title: "* Proportion of workflows requiring approvals (%)"
           },
           {
            type: "text",
            name: "question17",
            title: "* Decision support time reduction (%)"
           }
          ],
          title: "* Decision Analytics"
         },
         {
          type: "panel",
          name: "panel7",
          elements: [
           {
            type: "text",
            name: "question19",
            title: "* Average dev & test time for app P2P for identity"
           },
           {
            type: "text",
            name: "question18",
            title: "* Number of applications the require identity"
           },
           {
            type: "text",
            name: "* Average number of P2P connections per app"
           },
           {
            type: "text",
            name: "* P2P annual maintenance rate"
           },
           {
            type: "text",
            name: "* Identity bus dev & test savings rate"
           },
           {
            type: "text",
            name: "* Identity bus annual maintenance rate"
           }
          ],
          title: "* Identity Bus"
         },
         {
          type: "panel",
          name: "panel8",
          elements: [
           {
            type: "text",
            name: "question20",
            title: "* Number of access connected systems (injection)"
           },
           {
            type: "text",
            name: "question21",
            title: "* Number of access connected systems (federation)"
           },
           {
            type: "text",
            name: "question22",
            title: "* Average login time (secs) avoided per SSO"
           },
           {
            type: "text",
            name: "question23",
            title: "* Effective working days per year"
           },
           {
            type: "text",
            name: "question24",
            title: "* Average dev & test time for app customisation"
           },
           {
            type: "text",
            name: "question25",
            title: "* Average dev & test time for app customisation"
           },
           {
            type: "text",
            name: "question26",
            title: "* Number of applications that require access"
           },
           {
            type: "text",
            name: "question27",
            title: "* Custom access annual maintenance rate"
           },
           {
            type: "text",
            name: "question28",
            title: "* access bus dev & test savings rate"
           },
           {
            type: "text",
            name: "question29",
            title: "* access bus annual maintenance rate"
           }
          ],
          title: "* Single Sign On"
         },
         {
          type: "panel",
          name: "panel9",
          elements: [
           {
            type: "text",
            name: "question30",
            title: "* Completeness of access revocations (%)"
           },
           {
            type: "text",
            name: "question31",
            title: "* Average risk impact per entitlement"
           },
           {
            type: "text",
            name: "question32",
            title: "* Average OpEx per entitlement"
           },
           {
            type: "text",
            name: "question33",
            title: "* Password breach likelihood"
           },
           {
            type: "text",
            name: "question34",
            title: "* Push notification break likelihood"
           },
           {
            type: "text",
            name: "question35",
            title: "* Proportion of stale (unused) entitlements"
           }
          ],
          title: "* Governance"
         }
        ],
        title: "Full Time Employees (FTEs)"
       }
      ]
     }
    ]
   }

   //End Structure
}
