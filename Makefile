.PHONY: deploy-v1
deploy-v1:
	TARGET=production yarn share-env
	fly deploy client
	fly deploy server

.PHONY: deploy-v2
deploy-v2:
	TARGET=production yarn share-env
	fly deploy v2
