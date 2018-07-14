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
        //a();
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
    canvas.width = 1000;
    canvas.height = 417;

    statusBarMessage("Generating PDF...")

    let doc = new jsPDF({
        orientation: 'l',
        unit: 'in',
        format: 'letter'
    })

    doc.setFontSize(12);
    doc.text(9.5, 1.10, `Prepared For: ${data.formData.client_name}`, null, null, 'right')
    doc.setFontSize(10);
    doc.text(1,1.55,"Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy")
    doc.text(1,1.725,"nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi")
    doc.text(1,1.900,"enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit")
    doc.text(1,2.075,"lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure.")
    doc.setFontSize(6)
    doc.text(7,1.41,"CONTACT")
    doc.setFontSize(9)
    doc.setTextColor(82, 114, 178)
    doc.setFontType("bold");
    doc.text(7,1.550,`${data.formData.prep.prep_name}, Micro Focus`)
    doc.setFontType("normal");
    doc.text(7,1.720,`${data.formData.prep.prep_email}`)
    doc.text(7,1.895,`${data.formData.prep.prep_other}`)
    doc.setDrawColor(74,116,181);
    doc.setLineWidth(0.02);
    doc.line(1, 1.25, 10, 1.25);
    doc.setFillColor(74,116,181)
    doc.rect(0,8,11,.5,'F')
    doc.setFillColor(238,237,237)
    doc.rect(1,2.25,9,1.25,'F')
    let mf_logo_URI = "data:image/png;base64,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"
    doc.addImage(mf_logo_URI, 'PNG', 1, .6, 2, .484)
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255)
    doc.text(1, 8.31, "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostru")

    function chartToPDF() {
        ctx.textAlign = "right";
        ctx.font = "bold 14pt Arial"
        ctx.fillStyle = "rgba(255,255,255,.95)"
        ctx.fillText("Micro Focus", 975, 390)

        ctx.textAlign = "right";
        ctx.font = "bold 14pt Arial"
        ctx.fillStyle = "rgba(204, 54, 49, 0.95)"
        ctx.fillText("Do Nothing", 900, 280)

        statusBarMessage("Compiling Elements...")
        URI = myChart.toBase64Image("image/png")
        doc.addImage(URI, 'PNG', 1, 3.75, 9, 3.75)
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
                lineTension: .1,
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
                    align: -140,
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
                padding: {
                    left: 0,
                    right: 8,
                    top: 8,
                    bottom: 0
                },
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
        let date = new Date();
        doc.save(`${results.formData.client_name.replace(/\W/g,'_')}_report_${(date.getMonth()+1)}_${date.getFullYear()}.pdf`)
    } else {
        statusBarMessage("No PDF")
    }
}

function a() {
    results = ROI_OBJECT(JSON.parse(localStorage.getItem("state")))
    let a = populateFields()
    $(".sv_complete_btn").click()
    return a
}