# CI란?
CI는 Continuous Integration의 약자로, 지속적인 통합이라는 의미를 가진다. CI는 개발자를 위한 자동화 프로세스라고 생각하면 쉽다. CI가 제대로 구현된다면, 협업 상황에서 여러 개발자가 동시에 코드 작업을 할 때, 서로 충돌하는 문제나 버그 등을 자동화 프로세스로 해결할 수 있다. 

CI를 통해서 개발자들은 코드 변경 사항을 main branch에 병합하는 작업을 훨씬 수월하게 자주 수행할 수 있다. 어떤 단계에서 자동화된 테스트가 실행되는지는 프로젝트마다 다르겠지만, 기본적으로 개발자가 코드를 수정하고 main branch에 merge를 시도할 때 자동화된 테스트(Unit test, integrated test 등)를 실행하고, 어플리케이션이 제대로 작동하는지 확인한 후에 merge를 하도록 만들 수 있다. 그리고 만약 충돌이 발생하더라도, CI를 통해서 버그를 빠르게 찾고 수정할 수 있다. 

그리고 prettier와 같은 auto formatter와 연동하여, 코드 포맷이 적절히 지켜졌는지 등의 테스트도 수행할 수 있고, 어떤 변수가 선언되고서 사용되지 않는 등의 문제도 탐지할 수 있게 된다.

---

# Github Action을 통한 Node.js 프로젝트 CI
## Github Action
Github Action은 앞서 설명한 CI/CD를 간편하게 구축할 수 있게 만들어 주는 Github의 공식 기능이다. Git Repository에서 특정 이벤트가 발생했을 때, workflow을 미리 세팅해놓을 수 있도록 만들어준다. 

사용법 자체는 간단하다. 원하는 repository에 .github/workflows 디렉토리 안에 yml 파일을 만들어, workflow를 명시해주면 이에 맞게 작동한다.

---

## CI 구축하기
### package.json
그렇다면 빈 repository부터 시작해서 하나씩 세팅해보면서, Node.js를 위한 CI를 구축해보겠다.

아래 링크에 있는 repository에서 이 작업을 수행했다. 단계별로 커밋을 해두었으니, 참고하면 좋을 듯하다.

> ### [Github Repository Link : nodejs-CI-CD-Template](https://github.com/devKangMinHyeok/nodejs-CI-CD-Template)

먼저 repository를 생성한 후에, 터미널에 npm init을 입력하는 것을 통해 package.json을 생성해주자.

**terminal**
```bash
$ npm init
```


**package.json**
```json
{
  "name": "ci-cd-test2",
  "version": "1.0.0",
  "description": "ci-cd-test2",
  "main": "index.js",
  "scripts": {},
  "repository": {
    "type": "git",
    "url": "git+https://github.com/devKangMinHyeok/ci-cd-test2.git"
  },
  "author": "minhyeok Kang",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/devKangMinHyeok/ci-cd-test2/issues"
  },
  "homepage": "https://github.com/devKangMinHyeok/ci-cd-test2#readme"
}
```

위와 같이 package.json을 생성해주고, 일단은 scripts 부분은 비워두자.

----

### 폴더 구조
이제 실제 기능을 담은 js 파일과 이를 테스트할 파일을 분리시키기 위해 폴더 구조를 설정한다.

이때, test 파일을 정리하는 방법이 크게 두 가지가 있다.

예를 들어, index.js 파일이 존재하고 이 파일에 우리가 만든 기능이 들어있다고 해보자.
그럼 index.spec.js 또는 index.test.js 파일을 생성하여, 나중에 소개할 jest를 통해 테스팅을 진행할 수 있다. 이 때, 두 테스트 코드를 넣는 두 가지 방식은 다음과 같다.

#### 1. 테스트할 대상이 되는 파일과 같은 위치에 테스트 코드 파일을 둔다.
React에서 이 방식을 많이 사용하는데, 이 경우 다음과 같은 폴더 구조를 갖게 된다.

```
├── src
│   ├── index.js
│   └── index.test.js
```

#### 2. src 폴더와 test 폴더를 따로 둔다.
이 방식을 사용하게 되면, 아래와 같은 구조를 갖는다.
```
├── src
│   └── index.js
├── test
│   ├── integration
│   │	└── index.test.js
│   └── unit
```

test 폴더 아래에 integration 폴더와 unit 폴더를 따로 두었다.
integration 폴더에는 통합 테스트를 진행하는 테스트 코드 파일을 넣고, 
unit 폴더에는 단위 테스트를 진행하는 테스트 코드 파일을 넣도록 구조를 설정할 수 있다.

**이 포스트에서는 2번 방식을 사용하여 아래와 같은 코드 구조로 만들고 진행하도록 하겠다.**
```
├── src
│	├── functions
│   │	├── sub.js
│   │	└── add.js
│   └── index.js
├── test
│   ├── integration
│   │	└── index.test.js
│   ├── unit
│   │	├── sub.test.js
│   │	└── add.test.js
```
<img src="https://velog.velcdn.com/images/kangdev/post/57b7178c-4728-49ea-b39e-516c9a037f7b/image.png" width="30%"/>

---

### Code
그럼 일단 add.js, sub.js, index.js 를 채워 넣고 진행하도록 하겠다. 
이해를 돕기 위해 최대한 간단하게 만든 기능이다.

**add.js**
```js
export const add = (a, b) => {
  return a + b;
};
```

**sub.js**
```js
export const sub = (a, b) => {
  return a - b;
};
```

**index.js**
```js
export const main = (a, b) => {
  return add(a, b) + sub(a, b);
};
```

----

### ESLint
ESLint는 코드 스타일을 체크하기 위한 라이브러리이다. 
먼저 ESLint를 이 프로젝트에 적용시켜 보도록 하겠다.

먼저 터미널에 아래 명령어를 통해 ESLint를 설치하겠다.

```bash
$ npm install eslint --save-dev

```

그러면 node_modules 폴더에 설치된 파일들이 저장된다.

이때, .gitignore 세팅을 통해 node_modules 폴더는 git에 올라가지 않도록 설정해보겠다.

**.gitignore**
```
node_modules/
```

그리고 아래 명령어를 통해 .eslintrc.json 파일을 생성해보겠다.
직접 파일을 만들어 설정할 수도 있지만, 아래 명령어를 사용하면 간단한 몇개의 질문을 통해 빠르게 .eslintrc.json을 생성할 수 있다.

``` bash
$ npx eslint --init
```

그럼 다음과 같은 파일이 생성된다.
**.eslintrc.json**
```json
{
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "standard",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
    }
}
```

기본적으로 standard 를 extend 하였고, rules에 몇 가지 설정을 추가해주겠다.

**.eslintrc.json**
```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": "standard",
  "overrides": [],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "semi": [2, "always"],
    "no-unused-vars": "warn"
  }
}
```

semi 설정은 semi colon을 필요한 곳에 항상 붙이도록 설정한 것이고, 2개 이상의 세미콜론이 연속으로 나오는 경우를 막도록 설정했다.

그리고 no-unused-vars는 사용되지 않는 변수들이 존재할 경우 error가 아닌 warn을 유발하도록 설정했다.

---

### Prettier
다음은 코드 포맷팅을 위한 Prettier를 설정해주겠다.
prettier는 기본적으로 프로젝트의 root에 있는 .prettierrc 파일에 적힌 룰에 의해서 동작한다.

그래서 먼저 .prettierrc 파일을 생성해주고 아래와 같이 설정해준다. 
이 설정은 프로젝트의 코드 스타일에 맞추어 수정할 수 있다.

**.prettierrc**
```json
{
  "bracketSpacing": false,
  "jsxBracketSameLine": true,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "arrowParens": "avoid",
  "endOfLine": "auto",
  "tabWidth": 2
}
```

그리고 npm 명령어를 사용하여 prettier를 설치해준다.

```bash
$ npm install prettier --save-dev
```

이제 ESLint와 Prettier를 연동해야 한다.

먼저 아래 명령어로 eslint-config-prettier 를 설치한다.

```
$ npm install eslint-config-prettier --save-dev
```

그리고 아까 만들었던 .eslintrc.json 파일을 다음과 같이 수정한다.
이때, 주의할 점은 prettier를 extends의 마지막에 넣어줘야 한다는 점이다. 
그래야 prettier 설정이 ESLint 코드 스타일 설정을 덮어쓸 수 있다.

**.eslintrc.json**
```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": ["standard", "prettier"],
  "overrides": [],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "semi": [2, "always"],
    "no-unused-vars": "warn"
  }
}

```

---

### yml 파일 설정
이제 본격적으로 자동화 프로세스를 설정하겠다.

먼저 루트에서 .github/workflows 디렉토리를 생성하고, 그 안에 ci.yml 파일을 생성하여 넣어준다.
ci.yml 파일의 기본 포맷은 다음과 같다.

**ci.yml**
```yml
name: Node.js CI

# 구독할 이벤트
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# jobs 단위로 개별 서버(정확히는 Docker 컨테이너 단위라고 한다.)에서 작업이 수행된다.
# 각 작업은 병렬로 실행 된다고 하는데, needs: build와 같이 표시해서 기다릴 수도 있다.
jobs:
  build:
    # Ubuntu, Windows, MacOS를 지원한다.
    runs-on: ubuntu-latest

    # node-version 과 같이 배열로 돼있으면, 해당 원소를 순회하면서 작업이 반복해서 실행된다.
    # 응용해서 runs-on에 여러 OS에서 돌릴 수도 있다.
    strategy:
      matrix:
        node-version: [14.x] # 템플릿 기본값: [10.x, 12.x, 14.x]

    # uses 개념은 다른 사람이 작성한 내용을 실행하는 개념이다.
    # actions/checkout: GitHub의 마지막 커밋으로 Checkout 한다.
    # actions/setup-node: Node.js를 설치한다.
    # run 개념은 명령어를 실행한다. 셸 스크립트와 동일하다.
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node-version }}
      # npm ci는 npm install과 같은 기능을 수행한다.
      - run: npm ci
      # --if-present 옵션은 npm 스크립트가 존재할 때만 실행시키라는 의미이다.
      # 만약 build 스크립트가 없는 경우, 오류 없이 지나간다.
      - run: npm run build --if-present
      - run: npm test
```

그리고 아직 ESLint를 package.json에 script로 설정하지 않았는데, 
package.json을 다음과 같이 수정한다.

**package.json**
```json
{
  "name": "ci-cd-test2",
  "version": "1.0.0",
  "description": "ci-cd-test2",
  "main": "index.js",
  "scripts": {
    "lint": "./node_modules/.bin/eslint ."
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/devKangMinHyeok/ci-cd-test2.git"
  },
  "author": "minhyeok Kang",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/devKangMinHyeok/ci-cd-test2/issues"
  },
  "homepage": "https://github.com/devKangMinHyeok/ci-cd-test2#readme",
  "devDependencies": {
    "eslint": "^8.31.0",
    "eslint-config-prettier": "^8.6.0",
    "eslint-config-standard": "^17.0.0",
    "eslint-plugin-import": "^2.26.0",
    "eslint-plugin-n": "^15.6.0",
    "eslint-plugin-promise": "^6.1.1",
    "prettier": "^2.8.2"
  }
}

```

정확히는 아래 부분이 변경되었다.

```json
"scripts": {
    "lint": "./node_modules/.bin/eslint ."
  },
```

그리고 ci.yml에 다음 명령어를 steps에 추가한다.

```yml
- run: npm run lint
```

그러면 현재까지 ci.yml 파일은 다음과 같다.

```yml
name: Node.js CI

# 구독할 이벤트
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# jobs 단위로 개별 서버(정확히는 Docker 컨테이너 단위라고 한다.)에서 작업이 수행된다.
# 각 작업은 병렬로 실행 된다고 하는데, needs: build와 같이 표시해서 기다릴 수도 있다.
jobs:
  build:
    # Ubuntu, Windows, MacOS를 지원한다.
    runs-on: ubuntu-latest

    # node-version 과 같이 배열로 돼있으면, 해당 원소를 순회하면서 작업이 반복해서 실행된다.
    # 응용해서 runs-on에 여러 OS에서 돌릴 수도 있다.
    strategy:
      matrix:
        node-version: [14.x] # 템플릿 기본값: [10.x, 12.x, 14.x]

    # uses 개념은 다른 사람이 작성한 내용을 실행하는 개념이다.
    # actions/checkout: GitHub의 마지막 커밋으로 Checkout 한다.
    # actions/setup-node: Node.js를 설치한다.
    # run 개념은 명령어를 실행한다. 셸 스크립트와 동일하다.
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node-version }}
      # npm ci는 npm install과 같은 기능을 수행한다.
      - run: npm ci
      # --if-present 옵션은 npm 스크립트가 존재할 때만 실행시키라는 의미이다.
      # 만약 build 스크립트가 없는 경우, 오류 없이 지나간다.
      - run: npm run build --if-present
      - run: npm run lint
      - run: npm test

```

그럼 이제 test를 설정하기 위해 jest 라이브러리를 활용해보겠다.
먼저 jest를 설치한다.

```
$ npm install jest --save-dev
```

그리고 package.json의 script 부분에 다음 명령을 추가한다.

```json
"test": "jest"
```

그럼 현재까지 package.json은 다음과 같다.

**package.json**
```json
{
  "name": "ci-cd-test2",
  "version": "1.0.0",
  "description": "ci-cd-test2",
  "main": "index.js",
  "scripts": {
    "lint": "./node_modules/.bin/eslint .",
    "test": "jest"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/devKangMinHyeok/ci-cd-test2.git"
  },
  "author": "minhyeok Kang",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/devKangMinHyeok/ci-cd-test2/issues"
  },
  "homepage": "https://github.com/devKangMinHyeok/ci-cd-test2#readme",
  "devDependencies": {
    "eslint": "^8.31.0",
    "eslint-config-prettier": "^8.6.0",
    "eslint-config-standard": "^17.0.0",
    "eslint-plugin-import": "^2.26.0",
    "eslint-plugin-n": "^15.6.0",
    "eslint-plugin-promise": "^6.1.1",
    "jest": "^29.3.1",
    "prettier": "^2.8.2"
  }
}
```

그리고 ESLint와의 호환을 위해 eslint-plugin-jest를 설치해주어야 한다.
명령어는 다음과 같다.

```bash
$ npm i --save-dev eslint-plugin-jest
```

그리고 root에서 eslintrc.yml 파일을 생성해주고 다음과 같이 설정한다.

**eslintrc.yml**

```yml
env:
  jest: true # Jest 글로벌
plugins:
  - jest # Jest 테스트를 위해 플러그인이 필요하다.
rules:
  # Jest Eslint 옵션은 0,1,2 (off, warn, error) 만 옵션으로 사용 가능하다.
  jest/no-disabled-tests:
    - warn
  jest/no-focused-tests:
    - error
  jest/no-identical-title:
    - error
  jest/prefer-to-have-length:
    - warn
  jest/valid-expect:
    - error

```

----

### test code
이제 test code를 작성해야 한다. test code는 다음과 같다.

**add.test.js**
```js
import {add} from '../../src/functions/add';

test('add 1 + 2 to equal 3', () => {
  expect(add(1, 2)).toBe(3);
});

```

**sub.test.js**
```js
import {sub} from '../../src/functions/sub';

test('sub 2 - 1 to equal 1', () => {
  expect(sub(2, 1)).toBe(1);
});

```

**index.test.js**
```js
import {main} from '../../src/index';

test('main 1 , 2 to equal 2', () => {
  expect(main(1, 2)).toBe(2);
});

```

---

### build 전에 merge 불가하도록 github 설정
이 과정은 선택이지만, build 전에 merge 할 수 없도록 github에서 설정할 수 있다.

이 기능은 GitHub에서 제공하는 Branch Protection Rule이라는 기능이다. 

레포지토리 > Settings 탭 > Branches 탭 > Branch protection rules 탭 > Add Rule 버튼 클릭 후 아래와 같이 설정하였다.


![](https://velog.velcdn.com/images/kangdev/post/f9cd57a1-320f-42fa-8aed-b312dd9987c1/image.png)

---

### Fix
이제 지금까지의 작업을 main 브랜치에 push 하자.

이후 PR을 남겨보면 다음과 같은 과정이 진행된다.
<img src="https://velog.velcdn.com/images/kangdev/post/6e615899-0db5-4169-9b05-3b4632711eb6/image.png" width="60%" />

그런데 이후 테스트가 실패했다는 표시가 보인다.

![](https://velog.velcdn.com/images/kangdev/post/4829d903-41d5-49c6-bc69-9cfe9972d2d7/image.png)


우측의 Details에 들어가서 살펴보도록 하자.

![](https://velog.velcdn.com/images/kangdev/post/807fb7f9-9e2d-42cf-b192-c4701be0ac5a/image.png)

npm run lint 명령에서 오류가 발생한 것을 확인할 수 있다.

더 자세히 살펴보면 다음과 같다.

![](https://velog.velcdn.com/images/kangdev/post/a4684d19-4ea6-4cae-b89c-7e2854b6bcf3/image.png)

일단 먼저, index.js 파일에서 add 함수와 sub 함수가 정의되지 않았다고 한다.

이는 index.js에서 add와 sub를 import 하지 않아서 발생한 문제이다.

그래서 index.js 파일을 다음과 같이 수정한다.

**index.js**
```js
import {add} from './functions/add';
import {sub} from './functions/sub';

export const main = (a, b) => {
  return add(a, b) + sub(a, b);
};

```

그리고 index.test.js에서는 test 함수와 expect 함수가 정의되지 않았다고 한다.

하지만 이 명령어들은 jest에서 사용되는 명령어인데, 어떻게 해야할까?

이 문제를 해결하기 위해서는 몇가지 설정이 필요하다.

---

### eslintrc.json에서 env 설정

eslintrc.json에서 env 설정에 jest 설정을 추가해야 한다. 그래야 jest 명령어를 ESLint와 충돌없이 사용할 수 있다.

그래서 .eslintrc.json 파일을 다음과 같이 수정한다.

**.eslintrc.json**
```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "jest": true
  },
  "extends": ["standard", "prettier"],
  "overrides": [],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "semi": [2, "always"],
    "no-unused-vars": "warn"
  }
}
```

하지만 여기까지 수행하고 다시 PR을 남겨도, 또 문제가 발생한다.

![](https://velog.velcdn.com/images/kangdev/post/c9b05a69-2a95-42a1-b056-c12dd15dcf0e/image.png)

이번에는 lint 명령은 문제없이 패스했지만, test 명령에서 문제가 발생한다.

여기서도 몇 가지 설정이 필요하다.

---

### babel 설정
오류 메세지를 보면 현재 jest가 파일을 파싱하는데 실패했다고 나오고, syntax 문제라고 한다.

이는 jest가 ES6를 지원하지 않기 때문인데, 특히 우리가 코드에서 사용한 import 문은 ES6 문법이기 때문에, jest에서 파싱이 불가하다.
그래서 우리는 babel을 사용하여, 이 문제를 해결할 것이다. jest가 내부적으로 babel을 통해 translation을 하고 test를 실행하도록 설정해줄 것이다.

아래 명령어를 커맨드에 입력하여 @babel/core 와 @babel/preset-env를 설치하자.

```bash
$ npm install @babel/core @babel/preset-env --save-dev
```

그리고 루트 폴더에 babel.config.js 파일을 추가하고 다음과 같이 설정한다.

**babel.config.js**
```js
module.exports = {
  presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
};
```

그리고 변경사항을 커밋하면 테스트가 통과되는 것을 확인할 수 있고, 이제 merge가 가능해진다.

![](https://velog.velcdn.com/images/kangdev/post/2a6a0024-c975-485a-b0a3-730bb7843ad0/image.png)
![](https://velog.velcdn.com/images/kangdev/post/f30505d3-ade4-4861-b8a9-84a972dbf32a/image.png)

----

# 무엇이 개선되었는가?
지금껏 Node.js 환경에서 CI를 구축해보았다.

핵심 기능으로는,
1. ESLint를 통한 코드 스타일 체크
2. Prettier 적용 여부 체크
3. jest를 이용한 테스팅 자동화
가 있다.

이 정도만으로도 여러 개발자가 함께 작업할 때, 효율성과 정확성을 매우 높일 수 있다.

위 기능 외에도, ESLint를 통한 체크 후 fix 자동화나 자동 Prettier 적용 등으로 CI에서 기능을 더 추가할 수 있다.

또 만약 typescript를 사용하는 프로젝트라면, ESLint를 비롯한 여러 라이브러리에서 typescript를 컴파일 하는 과정 때문에, 설정이 달라질 수 있으니, 주의해야 한다.

여기에 CD workflow까지 추가하여 자동으로 배포까지 진행할 수 있도록 만든다면, 개발 및 배포에 있어서 최소한의 CI/CD를 구축했다고 말할 수 있곘다.

# Reference

https://jsqna.com/ci-1-github-actions-nodejs/

https://tech.kakao.com/2019/12/05/make-better-use-of-eslint/

https://ingg.dev/eslint/

https://jeonghwan-kim.github.io/series/2019/12/30/frontend-dev-env-lint.html

https://heewon26.tistory.com/262

https://thinkforthink.tistory.com/272

https://libertegrace.tistory.com/entry/TDD-TDD-%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0-Unit-Test-Jest
