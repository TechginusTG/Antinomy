
import React from 'react';

// 'props' 객체를 인자로 받아서 name 값을 화면에 보여주는 간단한 컴포넌트입니다.
// <Greeting name="React" /> 처럼 사용하면 "Hello, React!"가 출력됩니다.
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}

export default Greeting;
