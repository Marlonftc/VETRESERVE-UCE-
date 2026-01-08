output "qa_albs" {
  value = {
    identity_access       = module.qa_identity_access.alb_dns_name
    client_pet_management = module.qa_client_pet_management.alb_dns_name
    clinical_information  = module.qa_clinical_information.alb_dns_name
    communication         = module.qa_communication_insights.alb_dns_name
    integration           = module.qa_integration_automation.alb_dns_name
    scheduling            = module.qa_scheduling_appointments.alb_dns_name
  }
}
