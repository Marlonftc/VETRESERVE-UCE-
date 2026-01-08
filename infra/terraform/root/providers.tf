############################################
# QA Account 1 – Application Domains
############################################
provider "aws" {
  alias   = "qa_1"
  region  = "us-east-1"
  profile = "vetreserve-qa-1"

  default_tags {
    tags = {
      Project     = "VETRESERVE-UCE"
      Environment = "qa"
      Account     = "qa-1"
      ManagedBy   = "Terraform"
    }
  }
}

############################################
# QA Account 2 – Application Domains
############################################
provider "aws" {
  alias   = "qa_2"
  region  = "us-east-1"
  profile = "vetreserve-qa-2"

  default_tags {
    tags = {
      Project     = "VETRESERVE-UCE"
      Environment = "qa"
      Account     = "qa-2"
      ManagedBy   = "Terraform"
    }
  }
}

############################################
# QA Account 3 – Application Domains
############################################
provider "aws" {
  alias   = "qa_3"
  region  = "us-east-1"
  profile = "vetreserve-qa-3"

  default_tags {
    tags = {
      Project     = "VETRESERVE-UCE"
      Environment = "qa"
      Account     = "qa-3"
      ManagedBy   = "Terraform"
    }
  }
}

############################################
# Databases Account (Shared)
############################################
provider "aws" {
  alias   = "databases"
  region  = "us-east-1"
  profile = "vetreserve-databases"

  default_tags {
    tags = {
      Project     = "VETRESERVE-UCE"
      Environment = "qa"
      Layer       = "databases"
      ManagedBy   = "Terraform"
    }
  }
}
