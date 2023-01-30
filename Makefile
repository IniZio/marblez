.PHONY: deploy
deploy:
	TARGET=production yarn share-env
	./node_modules/.bin/lerna exec fly deploy

.PHONY: generate-secret
generate-secret:
	curl -s https://raw.githubusercontent.com/oursky/devsecops-secret/v1.0/generate-secret.sh \
	| bash -s -- ${FROM} ${TO}
