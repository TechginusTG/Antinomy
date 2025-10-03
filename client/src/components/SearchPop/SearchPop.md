# SearchPop Component & Hook

`SearchPop`은 텍스트 속 단어를 인라인 검색 버튼으로 바꿔주는 컴포넌트입니다. 단어에 마우스를 올리거나 포커스를 주면 하이라이트가 적용되고, 옆에 검색 아이콘이 나타나며 단어 전체가 하나의 검색 버튼이 됩니다.

이 동작을 제어하는 로직은 `useSearchPop` 커스텀 훅에 구현되어 있어 다른 컴포넌트에서도 동일한 방식으로 쉽게 사용할 수 있습니다.

## 주요 파일

- `SearchPop.jsx`: 단어와 검색 아이콘을 포함한 인라인 버튼 컴포넌트.
- `useSearchPop.js`: 활성화된 단어(`hoveredWordId`, `keyword`)를 추적하고 하이라이트를 토글하는 로직.
- `SearchPop.module.css`: 하이라이트, 버튼, 아이콘에 대한 스타일 정의.

---

## 사용 방법

### 1. 컴포넌트와 훅 임포트

```javascript
import SearchPop from './SearchPop';
import { useSearchPop } from './useSearchPop';
```

### 2. 훅 초기화

```javascript
const { popover, showPopover, hidePopover } = useSearchPop();
```

### 3. 기본 검색 동작

`SearchPop`은 클릭한 단어를 구글 검색으로 연결해 새 탭에서 열고, 새 탭이 차단되면 현재 탭에서 검색 페이지로 이동합니다. 검색이 끝난 뒤 하이라이트를 초기화하고 싶다면 `onAfterSearch`에 `hidePopover`를 전달하면 됩니다.

### 4. 단어를 `SearchPop`으로 감싸기

렌더링할 텍스트를 공백 기준으로 분리하고, 두 글자 이상인 토큰에 대해 `SearchPop`을 렌더링합니다. 각 단어는 고유한 `wordId`를 가져야 하며, 마우스를 올렸을 때 `showPopover`를 호출하여 현재 활성 단어를 갱신합니다.

```jsx
<div onMouseLeave={hidePopover}>
  {text.split(/(\s+)/).map((word, index) => {
    const cleanedWord = word.replace(/[.,\/#!$%^&*;:{}=\-_`~()]/g, '').trim();

    if (cleanedWord.length > 1) {
      const wordId = `content-word-${index}`;
      const isActive = popover.visible && popover.hoveredWordId === wordId;

      return (
        <SearchPop
          key={wordId}
          word={word}
          keyword={cleanedWord}
          isActive={isActive}
          onHighlight={() => showPopover(cleanedWord, wordId)}
          onUnhighlight={hidePopover}
          onAfterSearch={hidePopover}
        />
      );
    }

    return word; // 공백이나 한 글자 단어는 그대로 출력
  })}
</div>
```

> `SearchPop`은 기본적으로 구글 검색을 새 탭에서 열며, 팝업을 닫고 싶다면 `onAfterSearch`에 `hidePopover`를 넘겨 주세요.

> `fontSize` props를 넘기면(예: `fontSize={dynamicFontSize}`) 아이콘 크기를 주변 텍스트와 동일하게 맞출 수 있습니다.

### 5. 부모 컨테이너 이벤트 처리

텍스트를 감싸는 컨테이너의 `onMouseLeave`에 `hidePopover`를 연결해 영역을 벗어났을 때 하이라이트가 초기화되도록 합니다. 키보드 포커스가 빠져나갈 때도 `SearchPop`이 `onUnhighlight`를 호출하여 동일하게 초기화됩니다.

---

이 구조를 그대로 활용하면 어떤 텍스트 블록에서도 단어 하이라이트 + 검색 버튼 기능을 쉽게 추가할 수 있습니다.
