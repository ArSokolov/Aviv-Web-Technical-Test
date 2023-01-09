#!/usr/bin/env make

.DEFAULT_GOAL: help

MAKEFLAGS=--no-print-directory

DOCKER_COMPOSE?=docker-compose -p owner-technical-test

.PHONY: help
help: ## List all Makefile targets
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'
	@$(MAKE) python-help

##
## Containers 📦
## -------
##
.PHONY: build
build: ## Builds the docker image associated with the project
	$(MAKE) python-build

.PHONY: run
run: ## Start the containers
	$(DOCKER_COMPOSE) up -d

.PHONY: clean
clean: ## Remove containers
	$(DOCKER_COMPOSE) down --remove-orphans

.PHONY: clean-all
clean-all: ## Remove containers and volumes
	$(DOCKER_COMPOSE) down --remove-orphans -v
	docker image prune --filter label=owner-technical-test -af

python-%: ## Execute Python command that come from the Python sub Makefile
	# Extract the string right after `python-` and propagate it to Python sub Makefile
	# Example :
	# 	- "python-help" will run "help" from the python-pricemap Makefile
	# 	- "python-import-all-listings" will run "import-all-listings" from the python-pricemap Makefile
	@$(MAKE) -C pricemap-python $${$@}
