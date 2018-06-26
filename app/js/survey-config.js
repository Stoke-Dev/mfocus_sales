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
                activity_governance: ()=>(0),
                activity_governance_compliance: ()=>(0),
                account_fulfilment_provisioning_turn_over: ()=>(0),
                registrations: ()=>(0),
                password_reset: ()=>(0),
                it_fulfilment_change: ()=>(0),
                helpdesk_fulfilment_change: ()=>(0),
                workflow: ()=>(0),
                decision_analytics_auto_approvals: ()=>(0),
                decision_analytics_decision_support: ()=>(0),
                identity_bus_dev_test_cost: ()=>(0),
                identity_bus_point_to_point_maintenance: ()=>(0),
                single_sign_on: ()=>(0),
                access_bus_dev_test_cost: ()=>(0),
                custom_access_maintenance: ()=>(0),
                total_recurring_costs: ()=>(0)
            },
            year1: {
                entitlement_governance: ()=>(self.doNothingOption.year0.entitlement_governance()),
                activity_governance: ()=>(0),
                activity_governance_compliance: ()=>(0),
                account_fulfilment_provisioning_turn_over: ()=>(0),
                registrations: ()=>(0),
                password_reset: ()=>(0),
                it_fulfilment_change: ()=>(0),
                helpdesk_fulfilment_change: ()=>(0),
                workflow: ()=>(0),
                decision_analytics_auto_approvals: ()=>(0),
                decision_analytics_decision_support: ()=>(0),
                identity_bus_dev_test_cost: ()=>(0),
                identity_bus_point_to_point_maintenance: ()=>(0),
                single_sign_on: ()=>(0),
                access_bus_dev_test_cost: ()=>(0),
                custom_access_maintenance: ()=>(0),
                total_recurring_costs: ()=>(0)
            },
            year2: {
                entitlement_governance: ()=>(self.doNothingOption.year1.entitlement_governance() * 1.03),
                activity_governance: ()=>(0),
                activity_governance_compliance: ()=>(0),
                account_fulfilment_provisioning_turn_over: ()=>(0),
                registrations: ()=>(0),
                password_reset: ()=>(0),
                it_fulfilment_change: ()=>(0),
                helpdesk_fulfilment_change: ()=>(0),
                workflow: ()=>(0),
                decision_analytics_auto_approvals: ()=>(0),
                decision_analytics_decision_support: ()=>(0),
                identity_bus_dev_test_cost: ()=>(0),
                identity_bus_point_to_point_maintenance: ()=>(0),
                single_sign_on: ()=>(0),
                access_bus_dev_test_cost: ()=>(0),
                custom_access_maintenance: ()=>(0),
                total_recurring_costs: ()=>(0)
            },
            year3: {
                entitlement_governance: ()=>(self.doNothingOption.year2.entitlement_governance() * 1.03),
                activity_governance: ()=>(0),
                activity_governance_compliance: ()=>(0),
                account_fulfilment_provisioning_turn_over: ()=>(0),
                registrations: ()=>(0),
                password_reset: ()=>(0),
                it_fulfilment_change: ()=>(0),
                helpdesk_fulfilment_change: ()=>(0),
                workflow: ()=>(0),
                decision_analytics_auto_approvals: ()=>(0),
                decision_analytics_decision_support: ()=>(0),
                identity_bus_dev_test_cost: ()=>(0),
                identity_bus_point_to_point_maintenance: ()=>(0),
                single_sign_on: ()=>(0),
                access_bus_dev_test_cost: ()=>(0),
                custom_access_maintenance: ()=>(0),
                total_recurring_costs: ()=>(0)
            },
            year4: {
                entitlement_governance: ()=>(self.doNothingOption.year3.entitlement_governance() * 1.03),
                activity_governance: ()=>(0),
                activity_governance_compliance: ()=>(0),
                account_fulfilment_provisioning_turn_over: ()=>(0),
                registrations: ()=>(0),
                password_reset: ()=>(0),
                it_fulfilment_change: ()=>(0),
                helpdesk_fulfilment_change: ()=>(0),
                workflow: ()=>(0),
                decision_analytics_auto_approvals: ()=>(0),
                decision_analytics_decision_support: ()=>(0),
                identity_bus_dev_test_cost: ()=>(0),
                identity_bus_point_to_point_maintenance: ()=>(0),
                single_sign_on: ()=>(0),
                access_bus_dev_test_cost: ()=>(0),
                custom_access_maintenance: ()=>(0),
                total_recurring_costs: ()=>(0)
            },
            year5: {
                entitlement_governance: ()=>(self.doNothingOption.year4.entitlement_governance() * 1.03),
                activity_governance: ()=>(0),
                activity_governance_compliance: ()=>(0),
                account_fulfilment_provisioning_turn_over: ()=>(0),
                registrations: ()=>(0),
                password_reset: ()=>(0),
                it_fulfilment_change: ()=>(0),
                helpdesk_fulfilment_change: ()=>(0),
                workflow: ()=>(0),
                decision_analytics_auto_approvals: ()=>(0),
                decision_analytics_decision_support: ()=>(0),
                identity_bus_dev_test_cost: ()=>(0),
                identity_bus_point_to_point_maintenance: ()=>(0),
                single_sign_on: ()=>(0),
                access_bus_dev_test_cost: ()=>(0),
                custom_access_maintenance: ()=>(0),
                total_recurring_costs: ()=>(0)
            },
            total: {
                entitlement_governance: ()=>(self.doNothingOption.year1.entitlement_governance()+self.doNothingOption.year2.entitlement_governance()+self.doNothingOption.year3.entitlement_governance()+self.doNothingOption.year4.entitlement_governance()+self.doNothingOption.year5.entitlement_governance()),
                activity_governance: ()=>(0),
                activity_governance_compliance: ()=>(0),
                account_fulfilment_provisioning_turn_over: ()=>(0),
                registrations: ()=>(0),
                password_reset: ()=>(0),
                it_fulfilment_change: ()=>(0),
                helpdesk_fulfilment_change: ()=>(0),
                workflow: ()=>(0),
                decision_analytics_auto_approvals: ()=>(0),
                decision_analytics_decision_support: ()=>(0),
                identity_bus_dev_test_cost: ()=>(0),
                identity_bus_point_to_point_maintenance: ()=>(0),
                single_sign_on: ()=>(0),
                access_bus_dev_test_cost: ()=>(0),
                custom_access_maintenance: ()=>(0),
                total_recurring_costs: ()=>(0)
            },
        }

    }

    return self;
}

/*
//Client data
client_name,
client_poc,
client_poc_email,
prep_date,

//FTES,
FTES_num,
FTES_Wage,
Average_IT_staff_wage,
FTES_annual_turn_over,
//-Fulfilment,
FTES_id_conn_simple,
FTES_id_conn_simple_cost,
FTES_id_conn_medium,
FTES_id_conn_medium_cost,
FTES_id_conn_complex,
FTES_id_conn_complex_cost,
FTES_average_prov_cost,
FTES_n_entitlements,
FTES_Change_Biz,
FTES_Change_Biz_ent,
//- Self Service,
FTES_password_forgets,
Helpdesk_call_cost,
Helpdesk_password_reset_cost,
Helpdesk_av_wait,
FTES_SSPR_rate,
//- Workflows,
FTES_id_wf_simple,
FTES_id_wf_simple_cost,
FTES_id_wf_medium,
FTES_id_wf_medium_cost,
FTES_id_wf_complex,
FTES_id_wf_complex_cost,
FTES_average_wf_cost,
FTES_workflows_yr,
//- Decision Analytics,
FTES_approv_wage,
FTES_approv_time,
FTES_approv_manual,
FTES_approv_savings_rate,
//- Identity Bus,
FTES_P2P_dev_hrs,
FTES_id_apps,
FTES_id_apps_conn,
FTES_P2P_apps_mtce,
FTES_IB_apps_mtce,
//- Single Sign On,
FTES_AM_inj,
FTES_AM_fed,
FTES_AM_avg_login_time,
FTES_working_days,
FTES_cust_AM_dev_hrs,
FTES_AM_apps,
FTES_AM_cust_apps_mtce,
FTES_AB_apps_mtce,
//- Governance,
FTES_revocation_acc,
FTES_av_ent_risk_impact,
FTES_av_opex_ent,
FTES_password_breach_likelihood,
FTES_push_notification_likelihood,
FTES_stale_entitlement_rate,
FTES_man_compliance_reports,
FTES_num_app_monitor,
FTES_avg_time_per_app_compliance_report,
FTES_num_compliance_staff,

// CTES,
CTES_num,
CTES_Wage,
CTES_annual_turn_over,
//- Fulfilment,
CTES_n_entitlements,
//- Self Service,
CTES_passwords_forgets,
CTES_SSPR_rate,
//- Workflows,
CTES_workflows_yr,
//- Decision Analytics,
CTES_approv_manual,
//- Single Sign On,
CTES_AM_inj,
CTES_AM_fed,
//- Governance,
CTES_revocation_acc,
CTES_av_ent_risk_impact,
CTES_av_opex_ent,
CTES_stale_entitlement_rate,

//CUST,
CUST_num,
CUST_avg_val,
CUST_active
*/