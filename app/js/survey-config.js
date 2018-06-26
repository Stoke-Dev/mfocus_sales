var surveyJSON, survey, test;

Survey.Survey.cssType = "bootstrap";

$(document).ready(function(){

    $.getJSON("data/survey-layout.json", function(data) {

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

    test = ROI_OBJECT(survey.data);

    $("main.mf-maincontent > h1").html("Download Client Report");

    $("#mf_quick_directory").html("");
}

//ROI Closure Object - for self containted calculations
let ROI_OBJECT = function( obj ) {
    let data = {};

    for (let key in obj ) {
        data[key] = obj[key];
    }

    let self = {
        formData: data,

        //Computed values for report
        doNothingOption: {
            year0: {
                entitlement_governance: ()=>(data.FTES_num*(data.FTES_Change_Biz*data.FTES_Change_Biz_ent+data.FTES_annual_turn_over*data.FTES_n_entitlements)*(1-data.FTES_revocation_acc)*data.FTES_av_opex_ent),
                activity_governance: ()=>(data.FTES_num*data.FTES_n_entitlements*data.stale_entitlement_rate*data.FTES_av_opex_ent),
                activity_governance_compliance: ()=>(data.FTES_man_compliance_reports*data.FTES_num_app_monitor*data.FTES_avg_time_per_app_compliance_report*data.FTES_num_compliance_staff*(40)),
                account_fulfilment_provisioning_turn_over: ()=>(data.FTES_num*data.FTES_annual_turn_over*data.FTES_n_entitlements*data.FTES_average_prov_cost),
                registrations: ()=>(data.FTES_num*data.FTES_annual_turn_over*(data.FTES_n_entitlements*data.FTES_average_prov_cost/data.Average_IT_staff_wage*data.FTES_Wage+Helpdesk_password_reset_cost)),
                password_reset: ()=>(data.FTES_num*data.FTES_password_forgets*data.FTES_SSPR_rate*(data.Helpdesk_password_reset_cost+data.FTES_Wage*data.Helpdesk_av_wait/60)),
                it_fulfilment_change: ()=>(data.FTES_num*data.FTES_Change_Biz*data.FTES_Change_Biz_ent*data.FTES_average_prov_cost),
                helpdesk_fulfilment_change: ()=>(data.FTES_num*data.FTES_Change_Biz*data.FTES_Change_Biz_ent*(data.Helpdesk_call_cost+data.FTES_Wage*data.Helpdesk_av_wait/60)),
                workflow: ()=>(data.FTES_num*data.FTES_workflows_yr*data.FTES_average_wf_cost),
                decision_analytics_auto_approvals: ()=>(data.FTES_num*data.FTES_workflows_yr*data.FTES_approv_wage*data.FTES_approv_time/60*(1-data.FTES_approv_manual)),
                decision_analytics_decision_support: ()=>(self.doNothingOption.year0.decision_analytics_auto_approvals()*data.FTES_approv_savings_rate),
                identity_bus_dev_test_cost: ()=>((data.FTES_id_apps_conn*data.FTES_P2P_dev_hrs*data.Average_IT_staff_wage)+(data.FTES_id_apps-1)*(data.FTES_id_apps_conn*data.FTES_P2P_dev_hrs*data.Average_IT_staff_wage*0.5)),
                identity_bus_point_to_point_maintenance: ()=>(self.doNothingOption.year0.identity_bus_dev_test_cost()*FTES_P2P_apps_mtce),
                identity_bus_annual_maintenance: ()=>(self.doNothingOption.year0.identity_bus_dev_test_cost()*(1-.95)*.20),
                single_sign_on: ()=>((data.FTES_AM_inj+data.FTES_AM_fed-1)*data.FTES_AM_avg_login_time*data.FTES_working_days*data.FTES_Wage/3600*data.FTES_num),
                access_bus_dev_test_cost: ()=>((data.FTES_AM_inj+data.FTES_AM_fed)*data.FTES_cust_AM_dev_hrs*data.Average_IT_staff_wage),
                custom_access_maintenance: ()=>(self.doNothingOption.year0.access_bus_dev_test_cost()*data.FTES_AM_cust_apps_mtce),
                access_bus_annual_maintenance: ()=>(self.doNothingOption.year0.access_bus_dev_test_cost()*(1-.95)*.20),
                total_recurring_costs: ()=>(self.doNothingOption.year0.entitlement_governance()+self.doNothingOption.year0.activity_governance()+self.doNothingOption.year0.activity_governance_compliance()+self.doNothingOption.year0.account_fulfilment_provisioning_turn_over()+self.doNothingOption.year0.registrations()+self.doNothingOption.year0.password_reset()+self.doNothingOption.year0.it_fulfilment_change()+self.doNothingOption.year0.helpdesk_fulfilment_change()+self.doNothingOption.year0.workflow()+self.doNothingOption.year0.decision_analytics_auto_approvals()+self.doNothingOption.year0.decision_analytics_decision_support()+self.doNothingOption.year0.identity_bus_dev_test_cost()+self.doNothingOption.year0.identity_bus_point_to_point_maintenance()+self.doNothingOption.year0.single_sign_on()+self.doNothingOption.year0.access_bus_dev_test_cost()+self.doNothingOption.year0.custom_access_maintenance())
            },
            year1: {
                entitlement_governance: ()=>(self.doNothingOption.year0.entitlement_governance()),
                activity_governance: ()=>(self.doNothingOption.year0.activity_governance()),
                activity_governance_compliance: ()=>(self.doNothingOption.year0.activity_governance_compliance()),
                account_fulfilment_provisioning_turn_over: ()=>(self.doNothingOption.year0.account_fulfilment_provisioning_turn_over()),
                registrations: ()=>(self.doNothingOption.year0.registrations()),
                password_reset: ()=>(self.doNothingOption.year0.password_reset()),
                it_fulfilment_change: ()=>(self.doNothingOption.year0.it_fulfilment_change()),
                helpdesk_fulfilment_change: ()=>(self.doNothingOption.year0.helpdesk_fulfilment_change()),
                workflow: ()=>(self.doNothingOption.year0.workflow()),
                decision_analytics_auto_approvals: ()=>(self.doNothingOption.year0.decision_analytics_auto_approvals()),
                decision_analytics_decision_support: ()=>(self.doNothingOption.year0.decision_analytics_decision_support()),
                identity_bus_dev_test_cost: ()=>(self.doNothingOption.year0.identity_bus_dev_test_cost()),
                identity_bus_point_to_point_maintenance: ()=>(self.doNothingOption.year0.identity_bus_point_to_point_maintenance()),
                single_sign_on: ()=>(self.doNothingOption.year0.single_sign_on()),
                access_bus_dev_test_cost: ()=>(self.doNothingOption.year0.access_bus_dev_test_cost()),
                custom_access_maintenance: ()=>(self.doNothingOption.year0.custom_access_maintenance()),
                total_recurring_costs: ()=>(self.doNothingOption.year1.entitlement_governance()+self.doNothingOption.year1.activity_governance()+self.doNothingOption.year1.activity_governance_compliance()+self.doNothingOption.year1.account_fulfilment_provisioning_turn_over()+self.doNothingOption.year1.registrations()+self.doNothingOption.year1.password_reset()+self.doNothingOption.year1.it_fulfilment_change()+self.doNothingOption.year1.helpdesk_fulfilment_change()+self.doNothingOption.year1.workflow()+self.doNothingOption.year1.decision_analytics_auto_approvals()+self.doNothingOption.year1.decision_analytics_decision_support()+self.doNothingOption.year1.identity_bus_dev_test_cost()+self.doNothingOption.year1.identity_bus_point_to_point_maintenance()+self.doNothingOption.year1.single_sign_on()+self.doNothingOption.year1.access_bus_dev_test_cost()+self.doNothingOption.year1.custom_access_maintenance())
            },
            year2: {
                entitlement_governance: ()=>(self.doNothingOption.year1.entitlement_governance() * 1.03),
                activity_governance: ()=>(self.doNothingOption.year1.activity_governance() * 1.03),
                activity_governance_compliance: ()=>(self.doNothingOption.year1.activity_governance_compliance() * 1.03),
                account_fulfilment_provisioning_turn_over: ()=>(self.doNothingOption.year1.account_fulfilment_provisioning_turn_over() * 1.03),
                registrations: ()=>(self.doNothingOption.year1.registrations() * 1.03),
                password_reset: ()=>(self.doNothingOption.year1.password_reset() * 1.03),
                it_fulfilment_change: ()=>(self.doNothingOption.year1.it_fulfilment_change() * 1.03),
                helpdesk_fulfilment_change: ()=>(self.doNothingOption.year1.helpdesk_fulfilment_change() * 1.03),
                workflow: ()=>(self.doNothingOption.year1.workflow() * 1.03),
                decision_analytics_auto_approvals: ()=>(self.doNothingOption.year1.decision_analytics_auto_approvals() * 1.03),
                decision_analytics_decision_support: ()=>(self.doNothingOption.year1.decision_analytics_decision_support() * 1.03),
                identity_bus_dev_test_cost: ()=>(self.doNothingOption.year1.identity_bus_dev_test_cost() / 20 * 1.03),
                identity_bus_point_to_point_maintenance: ()=>(self.doNothingOption.year1.identity_bus_point_to_point_maintenance() * 1.03),
                single_sign_on: ()=>(self.doNothingOption.year1.single_sign_on() * 1.03),
                access_bus_dev_test_cost: ()=>(self.doNothingOption.year1.access_bus_dev_test_cost() / 20 * 1.03),
                custom_access_maintenance: ()=>(self.doNothingOption.year1.custom_access_maintenance() * 1.03),
                total_recurring_costs: ()=>(self.doNothingOption.year2.entitlement_governance()+self.doNothingOption.year2.activity_governance()+self.doNothingOption.year2.activity_governance_compliance()+self.doNothingOption.year2.account_fulfilment_provisioning_turn_over()+self.doNothingOption.year2.registrations()+self.doNothingOption.year2.password_reset()+self.doNothingOption.year2.it_fulfilment_change()+self.doNothingOption.year2.helpdesk_fulfilment_change()+self.doNothingOption.year2.workflow()+self.doNothingOption.year2.decision_analytics_auto_approvals()+self.doNothingOption.year2.decision_analytics_decision_support()+self.doNothingOption.year2.identity_bus_dev_test_cost()+self.doNothingOption.year2.identity_bus_point_to_point_maintenance()+self.doNothingOption.year2.single_sign_on()+self.doNothingOption.year2.access_bus_dev_test_cost()+self.doNothingOption.year2.custom_access_maintenance())
            },
            year3: {
                entitlement_governance: ()=>(self.doNothingOption.year2.entitlement_governance() * 1.03),
                activity_governance: ()=>(self.doNothingOption.year2.activity_governance() * 1.03),
                activity_governance_compliance: ()=>(self.doNothingOption.year2.activity_governance_compliance() * 1.03),
                account_fulfilment_provisioning_turn_over: ()=>(self.doNothingOption.year2.account_fulfilment_provisioning_turn_over() * 1.03),
                registrations: ()=>(self.doNothingOption.year2.registrations() * 1.03),
                password_reset: ()=>(self.doNothingOption.year2.password_reset() * 1.03),
                it_fulfilment_change: ()=>(self.doNothingOption.year2.it_fulfilment_change() * 1.03),
                helpdesk_fulfilment_change: ()=>(self.doNothingOption.year2.helpdesk_fulfilment_change() * 1.03),
                workflow: ()=>(self.doNothingOption.year2.workflow() * 1.03),
                decision_analytics_auto_approvals: ()=>(self.doNothingOption.year2.decision_analytics_auto_approvals() * 1.03),
                decision_analytics_decision_support: ()=>(self.doNothingOption.year2.decision_analytics_decision_support() * 1.03),
                identity_bus_dev_test_cost: ()=>(self.doNothingOption.year2.identity_bus_dev_test_cost() * 1.03),
                identity_bus_point_to_point_maintenance: ()=>(self.doNothingOption.year2.identity_bus_point_to_point_maintenance() * 1.03),
                single_sign_on: ()=>(self.doNothingOption.year2.single_sign_on() * 1.03),
                access_bus_dev_test_cost: ()=>(self.doNothingOption.year2.access_bus_dev_test_cost() * 1.03),
                custom_access_maintenance: ()=>(self.doNothingOption.year2.custom_access_maintenance() * 1.03),
                total_recurring_costs: ()=>(self.doNothingOption.year3.entitlement_governance()+self.doNothingOption.year3.activity_governance()+self.doNothingOption.year3.activity_governance_compliance()+self.doNothingOption.year3.account_fulfilment_provisioning_turn_over()+self.doNothingOption.year3.registrations()+self.doNothingOption.year3.password_reset()+self.doNothingOption.year3.it_fulfilment_change()+self.doNothingOption.year3.helpdesk_fulfilment_change()+self.doNothingOption.year3.workflow()+self.doNothingOption.year3.decision_analytics_auto_approvals()+self.doNothingOption.year3.decision_analytics_decision_support()+self.doNothingOption.year3.identity_bus_dev_test_cost()+self.doNothingOption.year3.identity_bus_point_to_point_maintenance()+self.doNothingOption.year3.single_sign_on()+self.doNothingOption.year3.access_bus_dev_test_cost()+self.doNothingOption.year3.custom_access_maintenance())
            },
            year4: {
                entitlement_governance: ()=>(self.doNothingOption.year3.entitlement_governance() * 1.03),
                activity_governance: ()=>(self.doNothingOption.year3.activity_governance() * 1.03),
                activity_governance_compliance: ()=>(self.doNothingOption.year3.activity_governance_compliance() * 1.03),
                account_fulfilment_provisioning_turn_over: ()=>(self.doNothingOption.year3.account_fulfilment_provisioning_turn_over() * 1.03),
                registrations: ()=>(self.doNothingOption.year3.registrations() * 1.03),
                password_reset: ()=>(self.doNothingOption.year3.password_reset() * 1.03),
                it_fulfilment_change: ()=>(self.doNothingOption.year3.it_fulfilment_change() * 1.03),
                helpdesk_fulfilment_change: ()=>(self.doNothingOption.year3.helpdesk_fulfilment_change() * 1.03),
                workflow: ()=>(self.doNothingOption.year3.workflow() * 1.03),
                decision_analytics_auto_approvals: ()=>(self.doNothingOption.year3.decision_analytics_auto_approvals() * 1.03),
                decision_analytics_decision_support: ()=>(self.doNothingOption.year3.decision_analytics_decision_support() * 1.03),
                identity_bus_dev_test_cost: ()=>(self.doNothingOption.year3.identity_bus_dev_test_cost() * 1.03),
                identity_bus_point_to_point_maintenance: ()=>(self.doNothingOption.year3.identity_bus_point_to_point_maintenance() * 1.03),
                single_sign_on: ()=>(self.doNothingOption.year3.single_sign_on() * 1.03),
                access_bus_dev_test_cost: ()=>(self.doNothingOption.year3.access_bus_dev_test_cost() * 1.03),
                custom_access_maintenance: ()=>(self.doNothingOption.year3.custom_access_maintenance() * 1.03),
                total_recurring_costs: ()=>(self.doNothingOption.year4.entitlement_governance()+self.doNothingOption.year4.activity_governance()+self.doNothingOption.year4.activity_governance_compliance()+self.doNothingOption.year4.account_fulfilment_provisioning_turn_over()+self.doNothingOption.year4.registrations()+self.doNothingOption.year4.password_reset()+self.doNothingOption.year4.it_fulfilment_change()+self.doNothingOption.year4.helpdesk_fulfilment_change()+self.doNothingOption.year4.workflow()+self.doNothingOption.year4.decision_analytics_auto_approvals()+self.doNothingOption.year4.decision_analytics_decision_support()+self.doNothingOption.year4.identity_bus_dev_test_cost()+self.doNothingOption.year4.identity_bus_point_to_point_maintenance()+self.doNothingOption.year4.single_sign_on()+self.doNothingOption.year4.access_bus_dev_test_cost()+self.doNothingOption.year4.custom_access_maintenance())
            },
            year5: {
                entitlement_governance: ()=>(self.doNothingOption.year4.entitlement_governance() * 1.03),
                activity_governance: ()=>(self.doNothingOption.year4.entitlement_governance() * 1.03),
                activity_governance_compliance: ()=>(self.doNothingOption.year4.activity_governance_compliance() * 1.03),
                account_fulfilment_provisioning_turn_over: ()=>(self.doNothingOption.year4.account_fulfilment_provisioning_turn_over() * 1.03),
                registrations: ()=>(self.doNothingOption.year4.registrations() * 1.03),
                password_reset: ()=>(self.doNothingOption.year4.password_reset() * 1.03),
                it_fulfilment_change: ()=>(self.doNothingOption.year4.it_fulfilment_change() * 1.03),
                helpdesk_fulfilment_change: ()=>(self.doNothingOption.year4.helpdesk_fulfilment_change() * 1.03),
                workflow: ()=>(self.doNothingOption.year4.workflow() * 1.03),
                decision_analytics_auto_approvals: ()=>(self.doNothingOption.year4.decision_analytics_auto_approvals() * 1.03),
                decision_analytics_decision_support: ()=>(self.doNothingOption.year4.decision_analytics_decision_support() * 1.03),
                identity_bus_dev_test_cost: ()=>(self.doNothingOption.year4.identity_bus_dev_test_cost() * 1.03),
                identity_bus_point_to_point_maintenance: ()=>(self.doNothingOption.year4.identity_bus_point_to_point_maintenance() * 1.03),
                single_sign_on: ()=>(self.doNothingOption.year4.single_sign_on() * 1.03),
                access_bus_dev_test_cost: ()=>(self.doNothingOption.year4.access_bus_dev_test_cost() * 1.03),
                custom_access_maintenance: ()=>(self.doNothingOption.year4.custom_access_maintenance() * 1.03),
                total_recurring_costs: ()=>(self.doNothingOption.year5.entitlement_governance()+self.doNothingOption.year5.activity_governance()+self.doNothingOption.year5.activity_governance_compliance()+self.doNothingOption.year5.account_fulfilment_provisioning_turn_over()+self.doNothingOption.year5.registrations()+self.doNothingOption.year5.password_reset()+self.doNothingOption.year5.it_fulfilment_change()+self.doNothingOption.year5.helpdesk_fulfilment_change()+self.doNothingOption.year5.workflow()+self.doNothingOption.year5.decision_analytics_auto_approvals()+self.doNothingOption.year5.decision_analytics_decision_support()+self.doNothingOption.year5.identity_bus_dev_test_cost()+self.doNothingOption.year5.identity_bus_point_to_point_maintenance()+self.doNothingOption.year5.single_sign_on()+self.doNothingOption.year5.access_bus_dev_test_cost()+self.doNothingOption.year5.custom_access_maintenance())
            },
            total: {
                entitlement_governance: ()=>(self.doNothingOption.year1.entitlement_governance()+self.doNothingOption.year2.entitlement_governance()+self.doNothingOption.year3.entitlement_governance()+self.doNothingOption.year4.entitlement_governance()+self.doNothingOption.year5.entitlement_governance()),
                activity_governance: ()=>(self.doNothingOption.year1.entitlement_governance()+self.doNothingOption.year2.entitlement_governance()+self.doNothingOption.year3.entitlement_governance()+self.doNothingOption.year4.entitlement_governance()+self.doNothingOption.year5.entitlement_governance()),
                activity_governance_compliance: ()=>(self.doNothingOption.year1.activity_governance_compliance()+self.doNothingOption.year2.activity_governance_compliance()+self.doNothingOption.year3.activity_governance_compliance()+self.doNothingOption.year4.activity_governance_compliance()+self.doNothingOption.year5.activity_governance_compliance()),
                account_fulfilment_provisioning_turn_over: ()=>(self.doNothingOption.year1.account_fulfilment_provisioning_turn_over()+self.doNothingOption.year2.account_fulfilment_provisioning_turn_over()+self.doNothingOption.year3.account_fulfilment_provisioning_turn_over()+self.doNothingOption.year4.xx()+self.doNothingOption.year5.account_fulfilment_provisioning_turn_over()),
                registrations: ()=>(self.doNothingOption.year1.registrations()+self.doNothingOption.year2.registrations()+self.doNothingOption.year3.registrations()+self.doNothingOption.year4.registrations()+self.doNothingOption.year5.registrations()),
                password_reset: ()=>(self.doNothingOption.year1.password_reset()+self.doNothingOption.year2.password_reset()+self.doNothingOption.year3.password_reset()+self.doNothingOption.year4.password_reset()+self.doNothingOption.year5.password_reset()),
                it_fulfilment_change: ()=>(self.doNothingOption.year1.it_fulfilment_change()+self.doNothingOption.year2.it_fulfilment_change()+self.doNothingOption.year3.it_fulfilment_change()+self.doNothingOption.year4.it_fulfilment_change()+self.doNothingOption.year5.it_fulfilment_change()),
                helpdesk_fulfilment_change: ()=>(self.doNothingOption.year1.helpdesk_fulfilment_change()+self.doNothingOption.year2.helpdesk_fulfilment_change()+self.doNothingOption.year3.helpdesk_fulfilment_change()+self.doNothingOption.year4.helpdesk_fulfilment_change()+self.doNothingOption.year5.helpdesk_fulfilment_change()),
                workflow: ()=>(self.doNothingOption.year1.workflow()+self.doNothingOption.year2.workflow()+self.doNothingOption.year3.workflow()+self.doNothingOption.year4.workflow()+self.doNothingOption.year5.workflow()),
                decision_analytics_auto_approvals: ()=>(self.doNothingOption.year1.decision_analytics_auto_approvals()+self.doNothingOption.year2.decision_analytics_auto_approvals()+self.doNothingOption.year3.decision_analytics_auto_approvals()+self.doNothingOption.year4.decision_analytics_auto_approvals()+self.doNothingOption.year5.decision_analytics_auto_approvals()),
                decision_analytics_decision_support: ()=>(self.doNothingOption.year1.decision_analytics_decision_support()+self.doNothingOption.year2.decision_analytics_decision_support()+self.doNothingOption.year3.decision_analytics_decision_support()+self.doNothingOption.year4.decision_analytics_decision_support()+self.doNothingOption.year5.decision_analytics_decision_support()),
                identity_bus_dev_test_cost: ()=>(self.doNothingOption.year1.identity_bus_dev_test_cost()+self.doNothingOption.year2.identity_bus_dev_test_cost()+self.doNothingOption.year3.identity_bus_dev_test_cost()+self.doNothingOption.year4.identity_bus_dev_test_cost()+self.doNothingOption.year5.identity_bus_dev_test_cost()),
                identity_bus_point_to_point_maintenance: ()=>(self.doNothingOption.year1.identity_bus_point_to_point_maintenance()+self.doNothingOption.year2.identity_bus_point_to_point_maintenance()+self.doNothingOption.year3.identity_bus_point_to_point_maintenance()+self.doNothingOption.year4.identity_bus_point_to_point_maintenance()+self.doNothingOption.year5.identity_bus_point_to_point_maintenance()),
                single_sign_on: ()=>(self.doNothingOption.year1.single_sign_on()+self.doNothingOption.year2.single_sign_on()+self.doNothingOption.year3.single_sign_on()+self.doNothingOption.year4.single_sign_on()+self.doNothingOption.year5.single_sign_on()),
                access_bus_dev_test_cost: ()=>(self.doNothingOption.year1.access_bus_dev_test_cost()+self.doNothingOption.year2.access_bus_dev_test_cost()+self.doNothingOption.year3.access_bus_dev_test_cost()+self.doNothingOption.year4.access_bus_dev_test_cost()+self.doNothingOption.year5.access_bus_dev_test_cost()),
                custom_access_maintenance: ()=>(self.doNothingOption.year1.custom_access_maintenance()+self.doNothingOption.year2.custom_access_maintenance()+self.doNothingOption.year3.custom_access_maintenance()+self.doNothingOption.year4.custom_access_maintenance()+self.doNothingOption.year5.custom_access_maintenance()),
                total_recurring_costs: ()=>(self.doNothingOption.year1.total_recurring_costs()+self.doNothingOption.year2.total_recurring_costs()+self.doNothingOption.year3.total_recurring_costs()+self.doNothingOption.year4.total_recurring_costs()+self.doNothingOption.year5.total_recurring_costs())
            },
        }

    }

    return self;
}
