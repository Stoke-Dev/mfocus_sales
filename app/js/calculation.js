//FTES,
let FTES_num,
    FTES_Wage,
    Average_IT_staff_wage,
    FTES_annual_turn_over;
//-Fulfilment,
let FTES_id_conn_simple,
    FTES_id_conn_simple_cost,
    FTES_id_conn_medium,
    FTES_id_conn_medium_cost,
    FTES_id_conn_complex,
    FTES_id_conn_complex_cost,
    FTES_average_prov_cost,
    FTES_n_entitlements,
    FTES_Change_Biz,
    FTES_Change_Biz_ent;
//- Self Service,
let FTES_password_forgets,
    Helpdesk_call_cost,
    Helpdesk_password_reset_cost,
    Helpdesk_av_wait,
    FTES_SSPR_rate;
//- Workflows,
let FTES_id_wf_simple,
    FTES_id_wf_simple_cost,
    FTES_id_wf_medium,
    FTES_id_wf_medium_cost,
    FTES_id_wf_complex,
    FTES_id_wf_complex_cost,
    FTES_average_wf_cost,
    FTES_workflows_yr;
//- Decision Analytics,
let FTES_approv_wage,
    FTES_approv_time,
    FTES_approv_manual,
    FTES_approv_savings_rate;
//- Identity Bus,
let FTES_P2P_dev_hrs,
    FTES_id_apps,
    FTES_id_apps_conn,
    FTES_P2P_apps_mtce,
    FTES_IB_apps_mtce;
//- Single Sign On,
let FTES_AM_inj,
    FTES_AM_fed,
    FTES_AM_avg_login_time,
    FTES_working_days,
    FTES_cust_AM_dev_hrs,
    FTES_AM_apps,
    FTES_AM_cust_apps_mtce,
    FTES_AB_apps_mtce;
//- Governance,
let FTES_revocation_acc,
    FTES_av_ent_risk_impact,
    FTES_av_opex_ent,
    password_breach_likelihood,
    push_notification_likelihood,
    stale_entitlement_rate;

// CTES,
let CTES_num,
    CTES_Wage,
    CTES_annual_turn_over;
//- Fulfilment,
let CTES_n_entitlements;
//- Self Service,
let CTES_passwords_forgets,
    CTES_SSPR_rate;
//- Workflows,
let CTES_workflows_yr;
//- Decision Analytics,
let CTES_approv_manual;
//- Single Sign On,
let CTES_AM_inj,
    CTES_AM_fed;
//- Governance,
let CTES_revocation_acc,
    CTES_av_ent_risk_impact,
    CTES_av_opex_ent,
    CTES_stale_entitlement_rate;

//CUST,
let CUST_avg_val,
    CUST_active;


