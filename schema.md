# Micro Focus Sales Schema

Schema for the Micro Focus sales calculator, values, calculations etc.

## FORM Data

### Client data
- client_name
- client_poc
- client_poc_email
- prep_date

### FTES
- FTES_num
- FTES_Wage
- Average_IT_staff_wage
- FTES_annual_turn_over
  #### Fulfilment
  - FTES_id_conn_simple
  - FTES_id_conn_simple_cost
  - FTES_id_conn_medium
  - FTES_id_conn_medium_cost
  - FTES_id_conn_complex
  - FTES_id_conn_complex_cost
  - FTES_average_prov_cost
  - FTES_n_entitlements
  - FTES_Change_Biz
  - FTES_Change_Biz_ent

  #### Self Service
  - FTES_password_forgets
  - Helpdesk_call_cost
  - Helpdesk_password_reset_cost
  - Helpdesk_av_wait
  - FTES_SSPR_rate

  #### Workflows
  - FTES_id_wf_simple
  - FTES_id_wf_simple_cost
  - FTES_id_wf_medium
  - FTES_id_wf_medium_cost
  - FTES_id_wf_complex
  - FTES_id_wf_complex_cost
  - FTES_average_wf_cost
  - FTES_workflows_yr

  #### Decision Analytics
  - FTES_approv_wage
  - FTES_approv_time
  - FTES_approv_manual
  - FTES_approv_savings_rate

  #### Identity Bus
  - FTES_P2P_dev_hrs
  - FTES_id_apps
  - FTES_id_apps_conn
  - FTES_P2P_apps_mtce
  - FTES_IB_apps_mtce

  #### Single Sign On
  - FTES_AM_inj
  - FTES_AM_fed
  - FTES_AM_avg_login_time
  - FTES_working_days
  - FTES_cust_AM_dev_hrs
  - FTES_AM_apps
  - FTES_AM_cust_apps_mtce
  - FTES_AB_apps_mtce

  #### Governance
  - FTES_revocation_acc
  - FTES_av_ent_risk_impact
  - FTES_av_opex_ent
  - FTES_password_breach_likelihood
  - FTES_push_notification_likelihood
  - FTES_stale_entitlement_rate
  - FTES_man_compliance_reports
  - FTES_num_app_monitor
  - FTES_avg_time_per_app_compliance_report
  - FTES_num_compliance_staff

### CTES
- CTES_num
- CTES_Wage
- CTES_annual_turn_over

  #### Fulfilment
  - CTES_n_entitlements

  #### Self Service
  - CTES_passwords_forgets
  - CTES_SSPR_rate

  #### Workflows
  - CTES_workflows_yr

  #### Decision Analytics
  - CTES_approv_manual

  #### Single Sign On
  - CTES_AM_inj
  - CTES_AM_fed

  #### Governance
  - CTES_revocation_acc
  - CTES_av_ent_risk_impact
  - CTES_av_opex_ent
  - CTES_stale_entitlement_rate

### CUST
- CUST_num
- CUST_avg_val
- CUST_active

## Calcualted Values

These values are defined as equation functions in the backend and can be invoked on the fly to generate the corresponding value

### DoNothing Option

*For years 0 - 5, and total (unless otherwise noted)*

- entitlement_governance
- activity_governance
- activity_governance_compliance
- account_fulfilment_provisioning_turn_over
- registrations
- password_reset
- it_fulfilment_change
- helpdesk_fulfilment_change
- workflow
- decision_analytics_auto_approvals
- decision_analytics_decision_support
- identity_bus_dev_test_cost
- identity_bus_point_to_point_maintenance
- identity_bus_annual_maintenance *(year0 only)*
- single_sign_on
- access_bus_dev_test_cost
- custom_access_maintenance
- access_bus_annual_maintenance *(year0 only)*
- total_recurring_costs

### Micro Focus Solution

[Values Here]

### Quantitative Benefits

[Values Here]
