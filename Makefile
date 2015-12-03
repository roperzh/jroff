LIBRARY=jroff
SHELL=/bin/bash
CORE_FILES=src/jroff.js src/core/{token,token_factory,lexer,parser}.js
MACROS=src/macros/*.js
GENERATORS=src/generators/*.js
SOURCE_FILES=src/utils/preamble.js ${CORE_FILES} ${MACROS} ${GENERATORS} src/utils/postamble.js
DIST=dist/${LIBRARY}.js
DIST_MIN=dist/${LIBRARY}.min.js
TEST=test/
COLOR=\033[0;33m
NO_COLOR=\033[0m
DATE=$(date +'%y.%m.%d %H:%M:%S')

all: build test

dist: beautify hint test min

build:
	$(notify_task)
	awk 'FNR==1{print ""}1' ${SOURCE_FILES} > ${DIST}

min:
	$(notify_task)
	node_modules/uglify-js/bin/uglifyjs \
		--comments "/\*\* [a-z]/i" -m < ${DIST} > ${DIST_MIN}

	wc ${DIST}
	gzip -9 < ${DIST} | wc
	gzip -9 < ${DIST_MIN} | wc

hint: build beautify
	$(notify_task)
	node_modules/.bin/jshint ${DIST}
	node_modules/.bin/jshint ${TEST}

beautify:
	$(notify_task)
	find {src,test,dist} -type f -name "*.js" ! -name '*.min.js'\
		-exec node_modules/.bin/js-beautify -r --good-stuff {} \;

test:
	$(notify_task)
	node_modules/.bin/istanbul cover \
		node_modules/.bin/_mocha test/test.js -- -R dot

doc: build
	$(notify_task)
	node_modules/.bin/jsdoc --verbose -d docs -t node_modules/minami ${DIST}

doc-build: doc
	$(notify_task)
	git checkout gh-pages
	rm -rf ./{fonts,scripts,styles} && mv -f docs/* .
	git commit -a -m "Update documentation - ${DATE}"
	git push origin gh-pages
	git checkout master

.PHONY: test

define notify_task
	@echo -e "${COLOR}\n*** $@ ***\n${NO_COLOR}"
endef
