var surveyJSON, survey, results, doc;

Survey.Survey.cssType = "bootstrap";

$(document).ready(function(){

    $.getJSON("data/survey-layout.json", function(data) {

        surveyJSON = data;

        survey = new Survey.Model(surveyJSON);

        survey.completedHtml = "<div style='text-align:center; margin:11px;'><h3 style='margin-bottom:11px;'>Report Generated...</h3><div id='results_listing'></div>",
        survey.onComplete.add(sendDataToServer);
        survey.questionTitleLocation = "left";
        survey.setValue('prep_date', toDatestring());
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
            b.cssClasses.itemTitle = "mf-item-title"
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

function populateFields(){
    if (!results) {
        return -1;
    }

    $("#surveyElement").html("<h1>Loading...</h1>");

    survey.clear();
    
    let count = 0;
    let qs = survey.getAllQuestions();
    for (let index = 0; index < qs.length; index++) {
        var el = qs[index]
        el.value = results.formData[el.name];
        count++;
    }

    survey.render();

    return count;
}


function sendDataToServer(survey) {
    results = ROI_OBJECT(survey.data);

    doc = computePDF(results);

    $("#results_listing").html(function(){
        let html = "";

        html += "<a href='#' onclick='genPDF()'>Download</a><br>"

        return html;
    });

    $("main.mf-maincontent > h1").html("Download Client Report");

    $("#mf_quick_directory").html("");
}

//ROI Closure Object - for self containted calculations
let ROI_OBJECT = function( obj ) {
    let data = {};

    for (let key in obj) {
        data[key] = obj[key];
    }

    let self = {
        formData: data,

        computedData: {
            FTES_average_prov_cost: ()=>((data.FTES_id_conn_simple*data.FTES_id_conn_simple_cost+data.FTES_id_conn_medium*data.FTES_id_conn_medium_cost+data.FTES_id_conn_complex*data.FTES_id_conn_complex_cost)/(data.FTES_id_conn_simple+data.FTES_id_conn_medium+data.FTES_id_conn_complex)),
            FTES_average_wf_cost: ()=>((data.FTES_id_wf_simple*data.FTES_id_wf_simple_cost+data.FTES_id_wf_medium*data.FTES_id_wf_medium_cost+data.FTES_id_wf_complex*data.FTES_id_wf_complex_cost)/(data.FTES_id_wf_simple+data.FTES_id_wf_medium+data.FTES_id_wf_complex))
        },

        //Computed values for report
        doNothingOption: {
            year0: {
                entitlement_governance: ()=>(data.FTES_num*(data.FTES_Change_Biz/100*data.FTES_Change_Biz_ent+data.FTES_annual_turn_over/100*data.FTES_n_entitlements)*(1-data.FTES_revocation_acc/100)*data.FTES_av_opex_ent),
                activity_governance: ()=>(data.FTES_num*data.FTES_n_entitlements*data.FTES_stale_entitlement_rate/100*data.FTES_av_opex_ent),
                activity_governance_compliance: ()=>(data.FTES_man_compliance_reports*data.FTES_num_app_monitor*data.FTES_avg_time_per_app_compliance_report*data.FTES_num_compliance_staff*(40)),
                account_fulfilment_provisioning_turn_over: ()=>(data.FTES_num*data.FTES_annual_turn_over/100*data.FTES_n_entitlements*self.computedData.FTES_average_prov_cost()),
                registrations: ()=>(data.FTES_num*data.FTES_annual_turn_over/100*(data.FTES_n_entitlements*self.computedData.FTES_average_prov_cost()/data.Average_IT_staff_wage*data.FTES_Wage+data.Helpdesk_password_reset_cost)),
                password_reset: ()=>(data.FTES_num*data.FTES_password_forgets*data.FTES_SSPR_rate/100*(data.Helpdesk_password_reset_cost+data.FTES_Wage*data.Helpdesk_av_wait/60)),
                it_fulfilment_change: ()=>(data.FTES_num*data.FTES_Change_Biz/100*data.FTES_Change_Biz_ent*self.computedData.FTES_average_prov_cost()),
                helpdesk_fulfilment_change: ()=>(data.FTES_num*data.FTES_Change_Biz/100*data.FTES_Change_Biz_ent*(data.Helpdesk_call_cost+data.FTES_Wage*data.Helpdesk_av_wait/60)),
                workflow: ()=>(data.FTES_num*data.FTES_workflows_yr*self.computedData.FTES_average_wf_cost()),
                decision_analytics_auto_approvals: ()=>(data.FTES_num*data.FTES_workflows_yr*data.FTES_approv_wage*data.FTES_approv_time/60*(1-data.FTES_approv_manual/100)),
                decision_analytics_decision_support: ()=>(self.doNothingOption.year0.decision_analytics_auto_approvals()*data.FTES_approv_savings_rate/100),
                identity_bus_dev_test_cost: ()=>((data.FTES_id_apps_conn*data.FTES_P2P_dev_hrs*data.Average_IT_staff_wage)+(data.FTES_id_apps-1)*(data.FTES_id_apps_conn*data.FTES_P2P_dev_hrs*data.Average_IT_staff_wage*0.5)),
                identity_bus_point_to_point_maintenance: ()=>(self.doNothingOption.year0.identity_bus_dev_test_cost()*data.FTES_P2P_apps_mtce/100),
                identity_bus_annual_maintenance: ()=>(self.doNothingOption.year0.identity_bus_dev_test_cost()*(1-.95)*.20),
                single_sign_on: ()=>((data.FTES_AM_inj+data.FTES_AM_fed-1)*data.FTES_AM_avg_login_time*data.FTES_working_days*data.FTES_Wage/3600*data.FTES_num),
                access_bus_dev_test_cost: ()=>((data.FTES_AM_inj+data.FTES_AM_fed)*data.FTES_cust_AM_dev_hrs*data.Average_IT_staff_wage),
                custom_access_maintenance: ()=>(self.doNothingOption.year0.access_bus_dev_test_cost()*data.FTES_AM_cust_apps_mtce/100),
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
                activity_governance: ()=>(self.doNothingOption.year4.activity_governance() * 1.03),
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
                activity_governance: ()=>(self.doNothingOption.year1.activity_governance()+self.doNothingOption.year2.activity_governance()+self.doNothingOption.year3.activity_governance()+self.doNothingOption.year4.activity_governance()+self.doNothingOption.year5.activity_governance()),
                activity_governance_compliance: ()=>(self.doNothingOption.year1.activity_governance_compliance()+self.doNothingOption.year2.activity_governance_compliance()+self.doNothingOption.year3.activity_governance_compliance()+self.doNothingOption.year4.activity_governance_compliance()+self.doNothingOption.year5.activity_governance_compliance()),
                account_fulfilment_provisioning_turn_over: ()=>(self.doNothingOption.year1.account_fulfilment_provisioning_turn_over()+self.doNothingOption.year2.account_fulfilment_provisioning_turn_over()+self.doNothingOption.year3.account_fulfilment_provisioning_turn_over()+self.doNothingOption.year4.account_fulfilment_provisioning_turn_over()+self.doNothingOption.year5.account_fulfilment_provisioning_turn_over()),
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
        },

        mf_solution: {
            year1: {
                mf_license: ()=>(1026+12420+12420+4860),
                mf_initial_support_maintenance: ()=>(216+2592+2592+999),
                mf_solution_implementation: ()=>(343200),
                total_non_recurring_costs: ()=>(self.mf_solution.year1.mf_license()+self.mf_solution.year1.mf_initial_support_maintenance()+self.mf_solution.year1.mf_solution_implementation()),
                total_recurring_costs: ()=>(0) //no recurring costs
            },
            year2: {
                identity_bus_annual_maintenance: ()=>(((data.FTES_id_apps_conn*data.FTES_P2P_dev_hrs*data.Average_IT_staff_wage)+(data.FTES_id_apps-1)*(data.FTES_id_apps_conn*data.FTES_P2P_dev_hrs*data.Average_IT_staff_wage*0.5))*(1-.95)*.20),
                access_bus_annual_maintenance: ()=>(((data.FTES_AM_inj+data.FTES_AM_fed)*data.FTES_cust_AM_dev_hrs*data.Average_IT_staff_wage)*(1-.95)*.20),
                ongoing_mf_support_maintenance: ()=>(self.mf_solution.year1.mf_initial_support_maintenance() * 1.05),
                total_non_recurring_costs: ()=>(0), //no non-recurring costs
                total_recurring_costs: ()=>(self.mf_solution.year2.identity_bus_annual_maintenance()+self.mf_solution.year2.access_bus_annual_maintenance()+self.mf_solution.year2.ongoing_mf_support_maintenance())
            },
            year3: {
                identity_bus_annual_maintenance: ()=>(self.mf_solution.year2.identity_bus_annual_maintenance() * 1.03),
                access_bus_annual_maintenance: ()=>(self.mf_solution.year2.access_bus_annual_maintenance() * 1.03),
                ongoing_mf_support_maintenance: ()=>(self.mf_solution.year2.ongoing_mf_support_maintenance() * 1.05),
                total_non_recurring_costs: ()=>(0), //no non-recurring costs
                total_recurring_costs: ()=>(self.mf_solution.year3.identity_bus_annual_maintenance()+self.mf_solution.year3.access_bus_annual_maintenance()+self.mf_solution.year3.ongoing_mf_support_maintenance())
            },
            year4: {
                identity_bus_annual_maintenance: ()=>(self.mf_solution.year3.identity_bus_annual_maintenance() * 1.03),
                access_bus_annual_maintenance: ()=>(self.mf_solution.year3.access_bus_annual_maintenance() * 1.03),
                ongoing_mf_support_maintenance: ()=>(self.mf_solution.year3.ongoing_mf_support_maintenance() * 1.05),
                total_non_recurring_costs: ()=>(0), //no non-recurring costs
                total_recurring_costs: ()=>(self.mf_solution.year4.identity_bus_annual_maintenance()+self.mf_solution.year4.access_bus_annual_maintenance()+self.mf_solution.year4.ongoing_mf_support_maintenance())
            },
            year5: {
                identity_bus_annual_maintenance: ()=>(self.mf_solution.year4.identity_bus_annual_maintenance() * 1.03),
                access_bus_annual_maintenance: ()=>(self.mf_solution.year4.access_bus_annual_maintenance() * 1.03),
                ongoing_mf_support_maintenance: ()=>(self.mf_solution.year4.ongoing_mf_support_maintenance() * 1.05),
                total_non_recurring_costs: ()=>(0), //no non-recurring costs
                total_recurring_costs: ()=>(self.mf_solution.year5.identity_bus_annual_maintenance()+self.mf_solution.year5.access_bus_annual_maintenance()+self.mf_solution.year5.ongoing_mf_support_maintenance())
            },
            total: {
                mf_license: ()=>(self.mf_solution.year1.mf_license()),
                mf_initial_support_maintenance: ()=>(self.mf_solution.year1.mf_initial_support_maintenance()),
                mf_solution_implementation: ()=>(self.mf_solution.year1.mf_solution_implementation()),
                identity_bus_annual_maintenance: ()=>(self.mf_solution.year2.identity_bus_annual_maintenance()+self.mf_solution.year3.identity_bus_annual_maintenance()+self.mf_solution.year4.identity_bus_annual_maintenance()+self.mf_solution.year5.identity_bus_annual_maintenance()),
                access_bus_annual_maintenance: ()=>(self.mf_solution.year2.access_bus_annual_maintenance()+self.mf_solution.year3.access_bus_annual_maintenance()+self.mf_solution.year4.access_bus_annual_maintenance()+self.mf_solution.year5.access_bus_annual_maintenance()),
                ongoing_mf_support_maintenance: ()=>(self.mf_solution.year2.ongoing_mf_support_maintenance()+self.mf_solution.year3.ongoing_mf_support_maintenance()+self.mf_solution.year4.ongoing_mf_support_maintenance()+self.mf_solution.year5.ongoing_mf_support_maintenance()),
                total_non_recurring_costs: ()=>(self.mf_solution.year1.total_non_recurring_costs()+self.mf_solution.year2.total_non_recurring_costs()+self.mf_solution.year3.total_non_recurring_costs()+self.mf_solution.year4.total_non_recurring_costs()+self.mf_solution.year5.total_non_recurring_costs()),
                total_recurring_costs: ()=>(self.mf_solution.year1.total_recurring_costs()+self.mf_solution.year2.total_recurring_costs()+self.mf_solution.year3.total_recurring_costs()+self.mf_solution.year4.total_recurring_costs()+self.mf_solution.year5.total_recurring_costs())
            }
        },

        total_costs: {
            year0: {
                do_nothing: ()=>(self.doNothingOption.year0.total_recurring_costs())
            },
            year1: {
                do_nothing: ()=>(self.doNothingOption.year1.total_recurring_costs()),
                mf_solution: ()=>(self.mf_solution.year1.total_non_recurring_costs()+self.mf_solution.year1.total_recurring_costs())
            },
            year2: {
                do_nothing: ()=>(self.doNothingOption.year2.total_recurring_costs()),
                mf_solution: ()=>(self.mf_solution.year2.total_non_recurring_costs()+self.mf_solution.year2.total_recurring_costs())
            },
            year3: {
                do_nothing: ()=>(self.doNothingOption.year3.total_recurring_costs()),
                mf_solution: ()=>(self.mf_solution.year3.total_non_recurring_costs()+self.mf_solution.year3.total_recurring_costs())
            },
            year4: {
                do_nothing: ()=>(self.doNothingOption.year4.total_recurring_costs()),
                mf_solution: ()=>(self.mf_solution.year4.total_non_recurring_costs()+self.mf_solution.year4.total_recurring_costs())
            },
            year5: {
                do_nothing: ()=>(self.doNothingOption.year5.total_recurring_costs()),
                mf_solution: ()=>(self.mf_solution.year5.total_non_recurring_costs()+self.mf_solution.year5.total_recurring_costs())
            },
            total: {
                do_nothing: ()=>(self.doNothingOption.total.total_recurring_costs()),
                mf_solution: ()=>(self.mf_solution.total.total_non_recurring_costs()+self.mf_solution.total.total_recurring_costs())
            }
        },

        quantitative_benefits: {
            year0: ()=>(0-self.total_costs.year0.do_nothing()),
            year1: ()=>(self.total_costs.year1.do_nothing() - self.total_costs.year1.mf_solution()),
            year2: ()=>(self.total_costs.year2.do_nothing() - self.total_costs.year2.mf_solution()),
            year3: ()=>(self.total_costs.year3.do_nothing() - self.total_costs.year3.mf_solution()),
            year4: ()=>(self.total_costs.year4.do_nothing() - self.total_costs.year4.mf_solution()),
            year5: ()=>(self.total_costs.year5.do_nothing() - self.total_costs.year5.mf_solution()),
            total: ()=>(self.total_costs.total.do_nothing() - self.total_costs.total.mf_solution())
        }
    }

    return self;
}

function toDatestring(date = new Date()) {
    var dd = date.getDate();
    var mm = date.getMonth()+1; //January is 0!

    var yyyy = date.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    var datestring = yyyy+'-'+mm+'-'+dd;
    return datestring
}


function computePDF(data) {
    var URI;

    var statusBarMessage = (t)=>{console.log(t)}

    statusBarMessage("Loading Charts...")

    var canvas = document.createElement('canvas');
    canvas.width = 1009;
    canvas.height = 577;

    statusBarMessage("Generating PDF...")

    let doc = new jsPDF({
        orientation: 'l',
        unit: 'in',
        format: 'letter'
    })

    doc.text(`Prepared For: ${data.formData.client_name}`, 1, 1)

    doc.text('notice: could not to compile remaining data...', 1, 7)

    function chartToPDF() {
        ctx.textAlign = "right";
        ctx.font = "bold 14pt Arial"
        ctx.fillStyle = "rgba(255,255,255,.95)"
        ctx.fillText("Micro Focus", 975, 530)

        ctx.textAlign = "right";
        ctx.font = "bold 14pt Arial"
        ctx.fillStyle = "rgba(204, 54, 49, 0.95)"
        ctx.fillText("Do Nothing", 900, 300)

        statusBarMessage("Compiling Elements...")
        URI = myChart.toBase64Image("image/png")
        doc.addImage(URI, 'PNG', 1, 1, 9, 5.15)
        statusBarMessage("Done!")
    }

    let mf_cumulative = {
        year2: data.total_costs.year1.mf_solution() + data.total_costs.year2.mf_solution(),
        year3: ()=>(mf_cumulative.year2 + data.total_costs.year3.mf_solution()),
        year4: ()=>(mf_cumulative.year3() + data.total_costs.year4.mf_solution())
    }

    let dn_cumulative = {
        year2: data.total_costs.year1.do_nothing() + data.total_costs.year2.do_nothing(),
        year3: ()=>(dn_cumulative.year2 + data.total_costs.year3.do_nothing()),
        year4: ()=>(dn_cumulative.year3() + data.total_costs.year4.do_nothing())
    }

    statusBarMessage("Rendering Images...")
    var ctx = canvas.getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ["Year 0", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
            datasets: [{
                data: [0, data.total_costs.year1.mf_solution(), mf_cumulative.year2, mf_cumulative.year3(), mf_cumulative.year4(), data.total_costs.total.mf_solution()],
                backgroundColor: 'rgba(74, 116, 181, .99)',
                borderWidth: 0,
                borderColor: 'transparent',
                pointBackgroundColor: 'rgb(74, 116, 181)',
                pointBorderColor: 'rgba(255,255,255,.1)',
                pointRadius: [0, 7, 7, 7, 7, 7],
                datalabels: {
                    align: -135,
                    offset: 8,
                    font: {
                        size: 16,
                    },
                    formatter: function(v,cx) {
                        if (0 == cx.dataIndex){return ''}
                        return `Year ${cx.dataIndex}: $${Math.round(v)}`
                    }
                }
            }, {
                data: [0, data.total_costs.year1.do_nothing(), dn_cumulative.year2, dn_cumulative.year3(), dn_cumulative.year4(), data.total_costs.total.do_nothing()],
                backgroundColor: 'rgba(204, 54, 49, 0.41)',
                borderWidth: 0,
                borderColor: 'transparent',
                pointBackgroundColor: 'rgba(204, 54, 49, 1)',
                pointRadius: [0, 8, 8, 8, 8, 8],
                datalabels: {
                    align: -135,
                    offset: 8,
                    textAlign: "right",
                    font: {
                        size: 14
                    },
                    formatter: function(v,cx) {
                        if (0 == cx.dataIndex){return ''}
                        return `Year ${cx.dataIndex}: $${Math.round(v)}`
                    }
                }
            }]
        },
        options: {
            responsive: false,
            layout: {
                padding: 8,
            },
            animation: {
                duration: 1,
                onComplete: chartToPDF
            },
            legend: {
                display: false,
            },
            scales: {
                xAxes:[{
                    gridLines: {
                        color: 'rgb(223,230,241)',
                        drawTicks: false,
                    },
                    ticks: {
                        display: false,
                        stepSize: 10,
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: 'rgb(223,230,241)',
                        drawTicks: false,
                    },
                    ticks: {
                        display: false,
                        beginAtZero: true,
                        stepSize: 100000
                    }
                }]
            }
        }
    });
    
    return doc;

}


function genPDF(){
    if (doc) {
        doc.save('two-by-four.pdf')
    } else {
        statusBarMessage("No PDF")
    }
}