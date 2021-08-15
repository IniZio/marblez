.PHONY: deploy
deploy:
	TARGET=production yarn share-env
	fly deploy client
	fly deploy server
	fly deploy v2