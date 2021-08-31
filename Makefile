.PHONY: deploy
deploy:
	TARGET=production yarn share-env
	fly deploy async
	fly deploy v2

.PHONY: generate-secret
generate-secret:
	curl -s https://raw.githubusercontent.com/oursky/devsecops-secret/v1.0/generate-secret.sh \
	| bash -s -- ${FROM} ${TO}
